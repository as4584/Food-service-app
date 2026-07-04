import uuid

from sqlalchemy import Column, String, Numeric, Integer, Boolean, Float, ForeignKey, Uuid

from app.models.base import Base, TimestampMixin


class Restaurant(Base, TimestampMixin):
    __tablename__ = "restaurants"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(120), nullable=False)
    town = Column(String(80), nullable=False)
    cuisine = Column(String(80), nullable=False)
    description = Column(String(500), nullable=True)
    image_emoji = Column(String(8), nullable=True)
    image_url = Column(String(500), nullable=True)
    website_url = Column(String(500), nullable=True)
    rating = Column(Numeric(2, 1), nullable=False, default="4.5")
    eta_minutes = Column(Integer, nullable=False, default=25)
    price_range = Column(String(4), nullable=False, default="$$")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    is_featured = Column(Boolean, nullable=False, default=False)


class MenuItem(Base, TimestampMixin):
    __tablename__ = "menu_items"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(Uuid, ForeignKey("restaurants.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(60), nullable=False)
    name = Column(String(120), nullable=False)
    description = Column(String(300), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    image_emoji = Column(String(8), nullable=True)
    image_url = Column(String(500), nullable=True)
    is_available = Column(Boolean, nullable=False, default=True)
