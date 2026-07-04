"""Pure, elapsed-time-based order status simulation.

No scheduler, no stored status column, no websockets — the stage is
recomputed from `created_at` on every read, so it can never drift out
of sync with reality and there's nothing to keep running in the background.
"""
from datetime import datetime, timezone
from enum import Enum


class OrderStage(str, Enum):
    PLACED = "placed"
    PREPARING = "preparing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"


STAGES = [OrderStage.PLACED, OrderStage.PREPARING, OrderStage.OUT_FOR_DELIVERY, OrderStage.DELIVERED]

# Seconds elapsed since created_at at which each stage begins.
# Tuned for a live demo (~6 minutes to fully "delivered").
# Lower these right before the pitch for a faster walkthrough if needed.
STAGE_THRESHOLDS_SECONDS = {
    OrderStage.PLACED: 0,
    OrderStage.PREPARING: 45,
    OrderStage.OUT_FOR_DELIVERY: 150,
    OrderStage.DELIVERED: 360,
}


def compute_order_status(created_at: datetime) -> dict:
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    elapsed = (now - created_at).total_seconds()

    stage = OrderStage.PLACED
    for s in STAGES:
        if elapsed >= STAGE_THRESHOLDS_SECONDS[s]:
            stage = s
    stage_index = STAGES.index(stage)

    next_threshold = (
        STAGE_THRESHOLDS_SECONDS[STAGES[stage_index + 1]]
        if stage_index + 1 < len(STAGES) else None
    )
    if next_threshold is None:
        progress_in_stage = 1.0
    else:
        span = next_threshold - STAGE_THRESHOLDS_SECONDS[stage]
        progress_in_stage = min(1.0, (elapsed - STAGE_THRESHOLDS_SECONDS[stage]) / span)

    return {
        "stage": stage.value,
        "stage_index": stage_index,
        "stage_count": len(STAGES),
        "progress_in_stage": round(progress_in_stage, 3),
        "seconds_elapsed": int(elapsed),
        "is_delivered": stage == OrderStage.DELIVERED,
    }
