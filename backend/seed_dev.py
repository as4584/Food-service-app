"""
Dev seed script — NJ shore restaurant demo dataset.

Usage (from backend/):
    python seed_dev.py

What it does:
  1. Ensures the DB schema exists (safe to run repeatedly)
  2. Seeds 6 NJ shore-town restaurants with full menus
  3. Prints a sample restaurant ID for quick manual curl testing
"""
import os
import sys
from decimal import Decimal

sys.path.insert(0, os.path.dirname(__file__))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.base import Base
from app.models.restaurant import Restaurant, MenuItem  # noqa: F401 — register model
from app.models.order import Order, OrderItem  # noqa: F401 — register model

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./shore_eats.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

RESTAURANTS = [
    dict(
        name="Salt & Boardwalk Pizza Co.",
        town="Point Pleasant Beach",
        cuisine="Pizza / Italian",
        description="Wood-fired boardwalk pizza a block from the beach.",
        image_emoji="🍕",
        image_url="https://plus.unsplash.com/premium_photo-1668771085743-1d2d19818140?auto=format&fit=crop&w=800&q=80",
        rating="4.7",
        eta_minutes=25,
        price_range="$$",
        menu=[
            dict(category="Appetizers", name="Garlic Knots", description="Baked to order, herb butter, parm.", price="6.99", image_emoji="🧄"),
            dict(category="Appetizers", name="Zeppole (6pc)", description="Fried dough, powdered sugar.", price="5.99", image_emoji="🍩"),
            dict(category="Boardwalk Classics", name="Jersey Tomato Pie", description="Sauce-on-top classic tomato pie.", price="18.99", image_emoji="🍅"),
            dict(category="Boardwalk Classics", name="Boardwalk Slice (2pc)", description="Grab-and-go cheese slices.", price="6.50", image_emoji="🍕"),
            dict(category="Mains", name="Chicken Parm Sub", description="Fried chicken cutlet, mozzarella, marinara.", price="12.99", image_emoji="🥪"),
            dict(category="Mains", name="Baked Ziti", description="House ricotta blend, slow-simmered sauce.", price="14.99", image_emoji="🍝"),
            dict(category="Drinks", name="Italian Ice", description="Lemon, cherry, or blue raspberry.", price="3.99", image_emoji="🧊"),
        ],
    ),
    dict(
        name="Pork Roll Palace",
        town="Asbury Park",
        cuisine="Diner / Breakfast All-Day",
        description="Jersey diner classics served all day, every day.",
        image_emoji="🍳",
        image_url="https://images.unsplash.com/photo-1702460831732-b75fcd58659e?auto=format&fit=crop&w=800&q=80",
        rating="4.6",
        eta_minutes=20,
        price_range="$",
        menu=[
            dict(category="Breakfast", name="Pork Roll, Egg & Cheese", description="On a hard roll, griddled.", price="7.49", image_emoji="🥪"),
            dict(category="Breakfast", name="Taylor Ham Bagel", description="Everything bagel, fried egg.", price="7.99", image_emoji="🥯"),
            dict(category="Breakfast", name="Disco Fries", description="Fries, brown gravy, mozzarella.", price="8.99", image_emoji="🍟"),
            dict(category="Bakery", name="Crumb Cake", description="Thick Jersey-style crumb topping.", price="4.99", image_emoji="🍰"),
            dict(category="Mains", name="Grilled Cheese & Tomato Soup", description="Classic diner combo.", price="10.99", image_emoji="🧀"),
            dict(category="Drinks", name="Diner Coffee", description="Bottomless cup.", price="2.99", image_emoji="☕"),
        ],
    ),
    dict(
        name="The Wooden Plank Tavern",
        town="Belmar",
        cuisine="American / Seafood",
        description="Dockside tavern fare with a raw bar twist.",
        image_emoji="🦀",
        image_url="https://images.unsplash.com/photo-1571167366136-b57e07761625?auto=format&fit=crop&w=800&q=80",
        rating="4.5",
        eta_minutes=30,
        price_range="$$",
        menu=[
            dict(category="Appetizers", name="Crab Cake Sliders (3pc)", description="Jumbo lump, remoulade.", price="14.99", image_emoji="🦀"),
            dict(category="Appetizers", name="Clam Chowder", description="New England style, oyster crackers.", price="7.99", image_emoji="🍲"),
            dict(category="Mains", name="Boardwalk Burger", description="Half-pound patty, cheddar, boardwalk fries.", price="15.99", image_emoji="🍔"),
            dict(category="Mains", name="Fish & Chips", description="Beer-battered cod, malt vinegar.", price="16.99", image_emoji="🐟"),
            dict(category="Desserts", name="Key Lime Pie", description="Graham crust, whipped cream.", price="6.99", image_emoji="🥧"),
            dict(category="Drinks", name="Birch Beer Float", description="NJ classic soda float.", price="4.99", image_emoji="🥤"),
        ],
    ),
    dict(
        name="Seaside Slice House",
        town="Seaside Heights",
        cuisine="Pizza / Boardwalk Snacks",
        description="Everything you want on the boardwalk, on one menu.",
        image_emoji="🎡",
        image_url="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
        rating="4.4",
        eta_minutes=22,
        price_range="$",
        menu=[
            dict(category="Boardwalk Classics", name="Sausage & Peppers Slice", description="Loaded slice, sweet peppers.", price="5.99", image_emoji="🍕"),
            dict(category="Boardwalk Classics", name="Funnel Cake", description="Powdered sugar, classic boardwalk treat.", price="7.99", image_emoji="🍥"),
            dict(category="Boardwalk Classics", name="Zeppole (8pc)", description="Fresh fried, powdered sugar.", price="6.99", image_emoji="🍩"),
            dict(category="Drinks", name="Snow Cone", description="Rainbow, cherry, or blue raspberry.", price="4.49", image_emoji="🍧"),
            dict(category="Mains", name="Boardwalk Cheesesteak", description="Griddled ribeye, provolone, onions.", price="12.99", image_emoji="🥙"),
        ],
    ),
    dict(
        name="Red Bank Raw Bar",
        town="Red Bank",
        cuisine="Seafood / Raw Bar",
        description="Navesink River seafood, oysters shucked to order.",
        image_emoji="🦪",
        image_url="https://images.unsplash.com/photo-1717251752308-2ef72f07484e?auto=format&fit=crop&w=800&q=80",
        rating="4.8",
        eta_minutes=28,
        price_range="$$$",
        menu=[
            dict(category="Raw Bar", name="Oysters on the Half Shell (6pc)", description="Local NJ oysters, mignonette.", price="16.99", image_emoji="🦪"),
            dict(category="Raw Bar", name="Jumbo Shrimp Cocktail", description="Chilled, house cocktail sauce.", price="14.99", image_emoji="🍤"),
            dict(category="Mains", name="Lobster Roll", description="Warm butter or cold mayo, split-top bun.", price="24.99", image_emoji="🦞"),
            dict(category="Mains", name="Jersey Corn Chowder", description="Sweet corn, bacon, cream.", price="9.99", image_emoji="🌽"),
            dict(category="Desserts", name="Boardwalk Fudge Brownie", description="Warm, vanilla ice cream.", price="7.99", image_emoji="🍫"),
        ],
    ),
    dict(
        name="Long Branch Taco Shack",
        town="Long Branch",
        cuisine="Mexican / Beach Fusion",
        description="Beachside tacos with a Jersey Shore twist.",
        image_emoji="🌮",
        image_url="https://images.unsplash.com/photo-1648437595587-e6a8b0cdf1f9?auto=format&fit=crop&w=800&q=80",
        rating="4.6",
        eta_minutes=24,
        price_range="$$",
        menu=[
            dict(category="Tacos", name="Fish Tacos (3pc)", description="Beer-battered, cabbage slaw, chipotle crema.", price="13.99", image_emoji="🌮"),
            dict(category="Tacos", name="Carne Asada Tacos (3pc)", description="Grilled steak, cilantro, onion.", price="14.99", image_emoji="🌮"),
            dict(category="Sides", name="Elote", description="Grilled corn, cotija, chili-lime.", price="5.99", image_emoji="🌽"),
            dict(category="Mains", name="Beachside Burrito", description="Rice, beans, choice of protein, guac.", price="12.99", image_emoji="🌯"),
            dict(category="Drinks", name="Horchata", description="Housemade cinnamon rice drink.", price="3.99", image_emoji="🥛"),
        ],
    ),
]


def main():
    print(f"[seed_dev] DB: {DATABASE_URL}")

    print("[seed_dev] Ensuring schema...")
    Base.metadata.create_all(bind=engine)
    print("[seed_dev] Schema OK.")

    db = SessionLocal()
    try:
        existing_names = {r.name for r in db.query(Restaurant).all()}
        created_restaurants = 0
        created_items = 0
        sample_restaurant_id = None

        for spec in RESTAURANTS:
            if spec["name"] in existing_names:
                restaurant = db.query(Restaurant).filter(Restaurant.name == spec["name"]).first()
                # Sync fields that are safe to update in place (e.g. a newly-added
                # image_url for a restaurant that was seeded before photos existed).
                restaurant.image_url = spec.get("image_url")
                restaurant.image_emoji = spec["image_emoji"]
                db.add(restaurant)
            else:
                restaurant = Restaurant(
                    name=spec["name"],
                    town=spec["town"],
                    cuisine=spec["cuisine"],
                    description=spec["description"],
                    image_emoji=spec["image_emoji"],
                    image_url=spec.get("image_url"),
                    rating=Decimal(spec["rating"]),
                    eta_minutes=spec["eta_minutes"],
                    price_range=spec["price_range"],
                )
                db.add(restaurant)
                db.flush()
                created_restaurants += 1

            # Backfill any missing menu items even for a restaurant that already existed —
            # covers a prior run that was interrupted after creating the restaurant row
            # but before all of its menu items were inserted.
            existing_item_names = {
                mi.name
                for mi in db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).all()
            }
            for item_spec in spec["menu"]:
                if item_spec["name"] in existing_item_names:
                    continue
                db.add(MenuItem(
                    restaurant_id=restaurant.id,
                    category=item_spec["category"],
                    name=item_spec["name"],
                    description=item_spec["description"],
                    price=Decimal(item_spec["price"]),
                    image_emoji=item_spec["image_emoji"],
                    is_available=True,
                ))
                created_items += 1

            if sample_restaurant_id is None:
                sample_restaurant_id = restaurant.id

        db.commit()
        total_restaurants = db.query(Restaurant).count()
        total_items = db.query(MenuItem).count()

        print(f"[seed_dev] Seeded {created_restaurants} restaurants, {created_items} menu items.")
        print(f"[seed_dev] Total: {total_restaurants} restaurants, {total_items} menu items.")
        print()
        print("=" * 60)
        print("Shore Eats dev data is ready.")
        print()
        print("Start the backend:")
        print("  uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload")
        print()
        print("Try it:")
        print("  curl http://localhost:8000/api/v1/health")
        print("  curl http://localhost:8000/api/v1/restaurants")
        print(f"  curl http://localhost:8000/api/v1/restaurants/{sample_restaurant_id}")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    main()
