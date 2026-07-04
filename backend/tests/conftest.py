import os
import tempfile
from decimal import Decimal

import pytest

_db_fd, _db_path = tempfile.mkstemp(suffix=".db")
os.close(_db_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{_db_path}"

from fastapi.testclient import TestClient  # noqa: E402

from app.main import app  # noqa: E402
from app.database import SessionLocal, engine  # noqa: E402
from app.models.restaurant import Restaurant, MenuItem  # noqa: E402


@pytest.fixture(scope="session")
def client():
    # Entering the context runs the app's lifespan, which applies Alembic
    # migrations against the temp DB — this also verifies migrations apply cleanly.
    with TestClient(app) as c:
        yield c
    engine.dispose()  # release sqlite file handle before removing it (required on Windows)
    try:
        os.remove(_db_path)
    except OSError:
        pass


@pytest.fixture()
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def seeded_restaurant(client, db_session):
    """A restaurant with every optional field populated, plus one menu item."""
    restaurant = Restaurant(
        name="Test Pizzeria",
        town="Test Town",
        cuisine="Pizza",
        description="A pizzeria for tests.",
        image_emoji="🍕",
        image_url="https://example.com/pizza.jpg",
        website_url="https://example.com/",
        rating=Decimal("4.5"),
        eta_minutes=20,
        price_range="$$",
        latitude=40.0,
        longitude=-74.0,
        is_featured=False,
    )
    db_session.add(restaurant)
    db_session.flush()

    menu_item = MenuItem(
        restaurant_id=restaurant.id,
        category="Pizza",
        name="Cheese Pizza",
        description="Classic.",
        price=Decimal("12.00"),
        image_emoji="🍕",
        image_url="https://example.com/cheese.jpg",
        is_available=True,
    )
    db_session.add(menu_item)
    db_session.commit()
    db_session.refresh(restaurant)
    db_session.refresh(menu_item)

    yield restaurant, menu_item

    db_session.delete(menu_item)
    db_session.delete(restaurant)
    db_session.commit()
