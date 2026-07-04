"""Pydantic schemas for restaurant/menu endpoints."""
from decimal import Decimal
from uuid import UUID
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MenuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    category: str
    name: str
    description: Optional[str] = None
    price: Decimal
    image_emoji: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool


class RestaurantListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    town: str
    cuisine: str
    image_emoji: Optional[str] = None
    image_url: Optional[str] = None
    website_url: Optional[str] = None
    rating: Decimal
    eta_minutes: int
    price_range: str
    is_featured: bool
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class RestaurantDetail(RestaurantListItem):
    description: Optional[str] = None
    menu_items: list[MenuItemResponse]
