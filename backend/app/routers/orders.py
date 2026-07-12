"""Order router — creates real, persisted orders and drives their lifecycle.

Customer endpoints:
    POST /api/v1/orders           — create order from a cart payload
    GET  /api/v1/orders/{id}      — fetch one order with computed status

Operations endpoints (merchant + driver dashboards):
    GET  /api/v1/orders                    — list/filter orders
    POST /api/v1/orders/{id}/accept        — merchant accepts a pending order
    POST /api/v1/orders/{id}/reject        — merchant declines a pending order
    POST /api/v1/orders/{id}/ready         — merchant marks food ready for pickup
    POST /api/v1/orders/{id}/pickup        — driver picks up a ready order
    POST /api/v1/orders/{id}/deliver       — driver marks an order delivered

There is no auth yet (see PRODUCTION_CHECKLIST.md §3); these are open endpoints
for the pilot. The state machine still refuses illegal transitions (409).
"""
from datetime import datetime, timezone
from decimal import Decimal, ROUND_HALF_UP
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import Restaurant, MenuItem
from app.models.order import Order, OrderItem
from app.schemas.order import (
    OrderCreate,
    OrderResponse,
    RejectOrderPayload,
    PickupOrderPayload,
)
from app.services.order_lifecycle import (
    OrderStatus,
    ACTIVE_STATUSES,
    compute_status_view,
    can_transition,
)

router = APIRouter(prefix="/orders", tags=["orders"])

NJ_SALES_TAX = Decimal("0.06625")
DELIVERY_FEE = Decimal("3.99")


def _to_response(order: Order, db: Session) -> OrderResponse:
    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    # SQLite drops tzinfo on round-trip even though it was written as UTC — reattach it
    # so both the status computation and the serialized timestamp are unambiguous.
    created_at_utc = order.created_at.replace(tzinfo=timezone.utc)
    status_info = compute_status_view(order, eta_minutes=restaurant.eta_minutes if restaurant else None)
    return OrderResponse(
        id=order.id,
        restaurant_id=order.restaurant_id,
        restaurant_name=restaurant.name if restaurant else "Unknown",
        restaurant_latitude=restaurant.latitude if restaurant else None,
        restaurant_longitude=restaurant.longitude if restaurant else None,
        customer_name=order.customer_name,
        delivery_address=order.delivery_address,
        subtotal=order.subtotal,
        tax=order.tax,
        delivery_fee=order.delivery_fee,
        total=order.total,
        items=items,
        created_at=created_at_utc.isoformat(),
        **status_info,
    )


def _get_order_or_404(order_id: UUID, db: Session) -> Order:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


def _transition(order: Order, target: OrderStatus, db: Session) -> None:
    """Apply a validated status change, stamping the matching audit timestamp."""
    if not can_transition(order.status, target.value):
        raise HTTPException(
            status_code=409,
            detail=f"Cannot move order from '{order.status}' to '{target.value}'.",
        )
    now = datetime.now(timezone.utc)
    order.status = target.value
    if target == OrderStatus.ACCEPTED:
        order.accepted_at = now
    elif target == OrderStatus.READY:
        order.ready_at = now
    elif target == OrderStatus.OUT_FOR_DELIVERY:
        order.out_for_delivery_at = now
    elif target == OrderStatus.DELIVERED:
        order.delivered_at = now


# ─── Create + fetch (customer) ───────────────────────────────────────────────

@router.post("", response_model=OrderResponse, status_code=201)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == payload.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    subtotal = Decimal("0.00")
    line_items = []
    for entry in payload.items:
        menu_item = db.query(MenuItem).filter(
            MenuItem.id == entry.menu_item_id, MenuItem.restaurant_id == restaurant.id
        ).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {entry.menu_item_id} not found")
        line_total = (menu_item.price * entry.quantity).quantize(Decimal("0.01"), ROUND_HALF_UP)
        subtotal += line_total
        line_items.append((menu_item, entry.quantity, line_total))

    tax = (subtotal * NJ_SALES_TAX).quantize(Decimal("0.01"), ROUND_HALF_UP)
    total = subtotal + tax + DELIVERY_FEE

    order = Order(
        restaurant_id=restaurant.id,
        customer_name=payload.customer_name or "Demo Guest",
        delivery_address=payload.delivery_address,
        subtotal=subtotal,
        tax=tax,
        delivery_fee=DELIVERY_FEE,
        total=total,
        status=OrderStatus.PENDING.value,
    )
    db.add(order)
    db.flush()

    for menu_item, quantity, line_total in line_items:
        db.add(OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            name_snapshot=menu_item.name,
            unit_price_snapshot=menu_item.price,
            quantity=quantity,
            line_total=line_total,
        ))

    db.commit()
    db.refresh(order)
    return _to_response(order, db)


# ─── List / filter (merchant + driver dashboards) ────────────────────────────

@router.get("", response_model=list[OrderResponse])
def list_orders(
    db: Session = Depends(get_db),
    restaurant_id: Optional[UUID] = None,
    status: Optional[list[str]] = Query(default=None),
    driver_name: Optional[str] = None,
    active_only: bool = False,
    limit: int = Query(default=50, ge=1, le=200),
):
    """List orders newest-first, with filters for the ops dashboards.

    - Merchant queue: ``restaurant_id=<id>&active_only=true``
    - Driver available: ``status=ready``
    - Driver's active runs: ``status=out_for_delivery&driver_name=<name>``
    """
    query = db.query(Order)
    if restaurant_id is not None:
        query = query.filter(Order.restaurant_id == restaurant_id)
    if driver_name:
        query = query.filter(Order.driver_name == driver_name)
    statuses: list[str] = []
    if status:
        for s in status:
            statuses.extend(part.strip() for part in s.split(",") if part.strip())
    if active_only:
        statuses = [s.value for s in ACTIVE_STATUSES]
    if statuses:
        query = query.filter(Order.status.in_(statuses))

    orders = query.order_by(Order.created_at.desc()).limit(limit).all()
    return [_to_response(o, db) for o in orders]


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: UUID, db: Session = Depends(get_db)):
    order = _get_order_or_404(order_id, db)
    return _to_response(order, db)


# ─── Merchant actions ────────────────────────────────────────────────────────

@router.post("/{order_id}/accept", response_model=OrderResponse)
def accept_order(order_id: UUID, db: Session = Depends(get_db)):
    order = _get_order_or_404(order_id, db)
    _transition(order, OrderStatus.ACCEPTED, db)
    db.commit()
    db.refresh(order)
    return _to_response(order, db)


@router.post("/{order_id}/reject", response_model=OrderResponse)
def reject_order(order_id: UUID, payload: RejectOrderPayload | None = None, db: Session = Depends(get_db)):
    order = _get_order_or_404(order_id, db)
    _transition(order, OrderStatus.REJECTED, db)
    order.rejected_reason = (payload.reason if payload else None) or "The restaurant can't take this order right now."
    db.commit()
    db.refresh(order)
    return _to_response(order, db)


@router.post("/{order_id}/ready", response_model=OrderResponse)
def mark_order_ready(order_id: UUID, db: Session = Depends(get_db)):
    order = _get_order_or_404(order_id, db)
    _transition(order, OrderStatus.READY, db)
    db.commit()
    db.refresh(order)
    return _to_response(order, db)


# ─── Driver actions ──────────────────────────────────────────────────────────

@router.post("/{order_id}/pickup", response_model=OrderResponse)
def pickup_order(order_id: UUID, payload: PickupOrderPayload, db: Session = Depends(get_db)):
    order = _get_order_or_404(order_id, db)
    _transition(order, OrderStatus.OUT_FOR_DELIVERY, db)
    order.driver_name = payload.driver_name
    db.commit()
    db.refresh(order)
    return _to_response(order, db)


@router.post("/{order_id}/deliver", response_model=OrderResponse)
def deliver_order(order_id: UUID, db: Session = Depends(get_db)):
    order = _get_order_or_404(order_id, db)
    _transition(order, OrderStatus.DELIVERED, db)
    db.commit()
    db.refresh(order)
    return _to_response(order, db)
