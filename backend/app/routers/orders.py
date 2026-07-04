"""Order router — creates real, persisted orders (no payment processing).

Endpoints:
    POST /api/v1/orders       — create order from a cart payload
    GET  /api/v1/orders/{id}  — fetch order with computed delivery status
"""
from datetime import timezone
from decimal import Decimal, ROUND_HALF_UP
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import Restaurant, MenuItem
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_status import compute_order_status

router = APIRouter(prefix="/orders", tags=["orders"])

NJ_SALES_TAX = Decimal("0.06625")
DELIVERY_FEE = Decimal("3.99")


def _to_response(order: Order, db: Session) -> OrderResponse:
    restaurant = db.query(Restaurant).filter(Restaurant.id == order.restaurant_id).first()
    items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    # SQLite drops tzinfo on round-trip even though it was written as UTC — reattach it
    # so both the status computation and the serialized timestamp are unambiguous.
    created_at_utc = order.created_at.replace(tzinfo=timezone.utc)
    status_info = compute_order_status(created_at_utc)
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


@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: UUID, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return _to_response(order, db)
