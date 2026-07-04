import uuid

from sqlalchemy import Column, String, Numeric, Integer, ForeignKey, Uuid, Index

from app.models.base import Base, TimestampMixin


class Order(Base, TimestampMixin):
    __tablename__ = "orders"
    __table_args__ = (Index("ix_orders_created_at", "created_at"),)

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    restaurant_id = Column(Uuid, ForeignKey("restaurants.id"), nullable=False)
    customer_name = Column(String(120), nullable=True, default="Demo Guest")
    delivery_address = Column(String(300), nullable=True)
    subtotal = Column(Numeric(10, 2), nullable=False)
    tax = Column(Numeric(10, 2), nullable=False)
    delivery_fee = Column(Numeric(10, 2), nullable=False, default="3.99")
    total = Column(Numeric(10, 2), nullable=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    order_id = Column(Uuid, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    menu_item_id = Column(Uuid, ForeignKey("menu_items.id"), nullable=True)
    name_snapshot = Column(String(120), nullable=False)
    unit_price_snapshot = Column(Numeric(10, 2), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    line_total = Column(Numeric(10, 2), nullable=False)
