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

    return RestaurantDetail(
        id=restaurant.id,
        name=restaurant.name,
        town=restaurant.town,
        cuisine=restaurant.cuisine,
        image_emoji=restaurant.image_emoji,
        image_url=restaurant.image_url,
        rating=restaurant.rating,
        eta_minutes=restaurant.eta_minutes,
        price_range=restaurant.price_range,
        is_featured=restaurant.is_featured,
        latitude=restaurant.latitude,
        longitude=restaurant.longitude,
        description=restaurant.description,
        menu_items=items,
    )
