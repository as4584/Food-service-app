"""Real, authoritative order lifecycle.

Unlike the old elapsed-time simulation (``order_status.py``), the order's stage
is now a persisted ``status`` column driven by real merchant and driver actions.
This module owns the state machine (which transitions are legal), the mapping to
the customer-facing 4-step tracker, and the assembly of the status view returned
by the API.
"""
from datetime import datetime, timezone
from enum import Enum
from typing import Optional


class OrderStatus(str, Enum):
    PENDING = "pending"              # placed, waiting for the restaurant
    ACCEPTED = "accepted"           # restaurant accepted, will start cooking
    PREPARING = "preparing"         # kitchen is cooking
    READY = "ready"                 # ready for a driver to pick up
    OUT_FOR_DELIVERY = "out_for_delivery"  # a driver has it
    DELIVERED = "delivered"         # terminal, success
    REJECTED = "rejected"           # terminal, restaurant declined


# Which statuses each status may move to. Anything not listed is a 409.
TRANSITIONS: dict[OrderStatus, set[OrderStatus]] = {
    OrderStatus.PENDING: {OrderStatus.ACCEPTED, OrderStatus.REJECTED},
    OrderStatus.ACCEPTED: {OrderStatus.PREPARING, OrderStatus.READY},
    OrderStatus.PREPARING: {OrderStatus.READY},
    OrderStatus.READY: {OrderStatus.OUT_FOR_DELIVERY},
    OrderStatus.OUT_FOR_DELIVERY: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.REJECTED: set(),
}

# Non-terminal states — used to drive the "active orders" filters.
ACTIVE_STATUSES = {
    OrderStatus.PENDING,
    OrderStatus.ACCEPTED,
    OrderStatus.PREPARING,
    OrderStatus.READY,
    OrderStatus.OUT_FOR_DELIVERY,
}

STATUS_LABELS: dict[OrderStatus, str] = {
    OrderStatus.PENDING: "Waiting for the restaurant",
    OrderStatus.ACCEPTED: "Accepted by the restaurant",
    OrderStatus.PREPARING: "Preparing your food",
    OrderStatus.READY: "Ready for pickup",
    OrderStatus.OUT_FOR_DELIVERY: "Out for delivery",
    OrderStatus.DELIVERED: "Delivered — enjoy!",
    OrderStatus.REJECTED: "Order declined by the restaurant",
}

# Map the real status onto the customer app's existing 4-step tracker
# (Placed → Preparing → Out for delivery → Delivered). ``stage`` values stay
# backward-compatible with the mobile client's STAGE_MESSAGES keys.
_STAGE_FOR_STATUS: dict[OrderStatus, tuple[str, int]] = {
    OrderStatus.PENDING: ("placed", 0),
    OrderStatus.ACCEPTED: ("preparing", 1),
    OrderStatus.PREPARING: ("preparing", 1),
    OrderStatus.READY: ("preparing", 1),
    OrderStatus.OUT_FOR_DELIVERY: ("out_for_delivery", 2),
    OrderStatus.DELIVERED: ("delivered", 3),
    OrderStatus.REJECTED: ("placed", 0),
}

STAGE_COUNT = 4


class InvalidTransition(Exception):
    """Raised when a caller attempts an illegal status change."""

    def __init__(self, current: str, target: str):
        self.current = current
        self.target = target
        super().__init__(f"Cannot move order from '{current}' to '{target}'.")


def can_transition(current: str, target: str) -> bool:
    try:
        return OrderStatus(target) in TRANSITIONS[OrderStatus(current)]
    except (ValueError, KeyError):
        return False


def _as_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt


def compute_status_view(order, eta_minutes: Optional[int] = None) -> dict:
    """Assemble the status fields the API returns for an order.

    Keeps the legacy stage/stage_index/progress fields (so the existing mobile
    tracker + map keep working) and adds the richer real-status fields.
    """
    status = OrderStatus(order.status)
    stage, stage_index = _STAGE_FOR_STATUS[status]

    created_at = _as_utc(order.created_at)
    now = datetime.now(timezone.utc)
    seconds_elapsed = int((now - created_at).total_seconds()) if created_at else 0

    # Progress within the current stage — only meaningful while out for
    # delivery, where we animate the map from pickup toward the customer using
    # the restaurant's advertised ETA as the (approximate) trip length.
    progress_in_stage = 0.0
    if status == OrderStatus.OUT_FOR_DELIVERY:
        started = _as_utc(order.out_for_delivery_at)
        if started and eta_minutes:
            elapsed = (now - started).total_seconds()
            progress_in_stage = max(0.0, min(1.0, elapsed / (eta_minutes * 60)))
    elif status == OrderStatus.DELIVERED:
        progress_in_stage = 1.0

    return {
        # legacy 4-step tracker fields (unchanged contract)
        "stage": stage,
        "stage_index": stage_index,
        "stage_count": STAGE_COUNT,
        "progress_in_stage": round(progress_in_stage, 3),
        "seconds_elapsed": seconds_elapsed,
        "is_delivered": status == OrderStatus.DELIVERED,
        # real lifecycle fields
        "status": status.value,
        "status_label": STATUS_LABELS[status],
        "rejected": status == OrderStatus.REJECTED,
        "rejected_reason": order.rejected_reason,
        "driver_name": order.driver_name,
    }
