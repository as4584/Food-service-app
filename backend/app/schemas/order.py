"""Pydantic schemas for order endpoints."""
from decimal import Decimal
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, Field, ConfigDict


class OrderItemCreate(BaseModel):
    menu_item_id: UUID
    quantity: int = Field(default=1, ge=1, le=99)


class OrderCreate(BaseModel):
    restaurant_id: UUID
    customer_name: Optional[str] = Field(default="Demo Guest", max_length=120)
    delivery_address: Optional[str] = Field(default=None, max_length=300)
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    menu_item_id: Optional[UUID] = None
    name_snapshot: str
    unit_price_snapshot: Decimal
    quantity: int
    line_total: Decimal


class OrderResponse(BaseModel):
    id: UUID
    restaurant_id: UUID
    restaurant_name: str
    restaurant_latitude: Optional[float] = None
    restaurant_longitude: Optional[float] = None
    customer_name: Optional[str] = None
    delivery_address: Optional[str] = None
    subtotal: Decimal
    tax: Decimal
    delivery_fee: Decimal
    total: Decimal
    items: list[OrderItemResponse]
    created_at: str

    # computed status fields (from services.order_status.compute_order_status)
    stage: str
    stage_index: int
    stage_count: int
    progress_in_stage: float
    seconds_elapsed: int
    is_delivered: bool
