"""Restaurant + menu router.

Endpoints:
    GET /api/v1/restaurants           — list restaurants
    GET /api/v1/restaurants/{id}      — restaurant detail + menu
"""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.restaurant import Restaurant, MenuItem
from app.schemas.restaurant import RestaurantListItem, RestaurantDetail

router = APIRouter(prefix="/restaurants", tags=["restaurants"])


@router.get("", response_model=list[RestaurantListItem])
def list_restaurants(db: Session = Depends(get_db)):
    return db.query(Restaurant).order_by(
        Restaurant.is_featured.desc(), Restaurant.town, Restaurant.name
    ).all()


@router.get("/{restaurant_id}", response_model=RestaurantDetail)
def get_restaurant(restaurant_id: UUID, db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restaurant not found")

    items = db.query(MenuItem).filter(
        MenuItem.restaurant_id == restaurant.id, MenuItem.is_available.is_(True)
    ).order_by(MenuItem.category, MenuItem.name).all()

    # Derive from RestaurantListItem instead of hand-listing every column here —
    # a field added to the model/list schema then flows through automatically
    # instead of silently staying null on this endpoint (see test_restaurants.py).
    return RestaurantDetail(
        **RestaurantListItem.model_validate(restaurant).model_dump(),
        description=restaurant.description,
        menu_items=items,
    )
