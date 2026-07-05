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

# Fictional demo restaurants replaced 2026-07-04 with real NJ shore businesses
# that have their own websites — retire the old rows on next seed run.
RETIRED_RESTAURANT_NAMES = [
    "Salt & Boardwalk Pizza Co.",
    "Pork Roll Palace",
    "The Wooden Plank Tavern",
    "Seaside Slice House",
    "Red Bank Raw Bar",
    "Long Branch Taco Shack",
]

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./shore_eats.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

RESTAURANTS = [
    dict(
        name="Master Pizza",
        town="Clifton",
        cuisine="Italian / Pizza",
        description="Real Clifton, NJ pizzeria — cheese pies, Sicilian squares, stuffed pizza, subs, and Italian classics.",
        image_emoji="🍕",
        image_url="https://slicelife.imgix.net/10469/photos/original/open-uri20171123-1172-1p54uiy?auto=compress&auto=format&w=800&q=80",
        website_url="https://www.masterpizzaofclifton.com/",
        category="pizza",
        rating="4.7",
        eta_minutes=28,
        price_range="$$",
        latitude=40.8584,
        longitude=-74.1638,
        is_featured=True,
        menu=[
            dict(category="Pizza", name="Cheese Pizza", description="Classic New York-style cheese pie.", price="11.95", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1598023696416-0193a0bcd302?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pizza", name="Sicilian Cheese Pizza", description="Thick-crust square pie.", price="19.45", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pizza", name="Buffalo Chicken Pizza", description="Buffalo chicken, mozzarella, ranch drizzle.", price="14.95", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pizza", name="Stuffed Pizza", description="Ricotta and mozzarella stuffed, red sauce on top.", price="22.75", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1689793605149-8c5c4b6db1cf?auto=format&fit=crop&w=800&q=80"),
            dict(category="Appetizers", name="Garlic Knots", description="Baked to order, herb butter, parm.", price="6.95", image_emoji="🧄", image_url="https://images.unsplash.com/photo-1769521001298-f0415c53e013?auto=format&fit=crop&w=800&q=80"),
            dict(category="Appetizers", name="Fried Calamari", description="Crispy calamari, marinara.", price="13.95", image_emoji="🦑", image_url="https://images.unsplash.com/photo-1763467940825-d067fb3baf22?auto=format&fit=crop&w=800&q=80"),
            dict(category="Appetizers", name="Mozzarella Sticks", description="Golden fried, marinara.", price="9.95", image_emoji="🧀", image_url="https://images.unsplash.com/photo-1778449665117-2c607bbc7415?auto=format&fit=crop&w=800&q=80"),
            dict(category="Subs & Sandwiches", name="Chicken Cheesesteak", description="Griddled chicken, provolone, peppers & onions.", price="11.95", image_emoji="🥙", image_url="https://images.unsplash.com/photo-1734769853702-c7444c039c8c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Subs & Sandwiches", name="Italian Hot Sub", description="Ham, salami, capicola, provolone, hots.", price="10.95", image_emoji="🥪", image_url="https://images.unsplash.com/photo-1777891257610-db6e1a9be7df?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pasta", name="Baked Ziti", description="House ricotta blend, slow-simmered sauce.", price="14.95", image_emoji="🍝", image_url="https://images.unsplash.com/photo-1671442131445-a99f2e59850a?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pasta", name="Chicken Parmigiana", description="Breaded chicken cutlet, mozzarella, spaghetti.", price="16.95", image_emoji="🍗", image_url="https://images.unsplash.com/photo-1777891257610-db6e1a9be7df?auto=format&fit=crop&w=800&q=80"),
            dict(category="Desserts", name="Cannoli", description="Ricotta filling, chocolate chips.", price="4.50", image_emoji="🍮", image_url="https://images.unsplash.com/photo-1641349268827-05362f5e726c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Desserts", name="Zeppoles", description="Fried dough, powdered sugar.", price="4.00", image_emoji="🍩", image_url="https://images.unsplash.com/photo-1641349268827-05362f5e726c?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Luigi's Famous Pizza",
        town="Point Pleasant Beach",
        cuisine="Pizza / Italian",
        description="Real Point Pleasant Beach pizzeria, family-run since 1988 — NY-style pies, subs, and pasta.",
        image_emoji="🍕",
        image_url="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80",
        website_url="https://luigisfamouspizzapointpleasant.com/",
        category="pizza",
        rating="4.6",
        eta_minutes=25,
        latitude=40.0954,
        longitude=-74.0534,
        price_range="$$",
        menu=[
            dict(category="Pizza", name="Plain Cheese Pizza", description="Classic cheese, or create your own.", price="18.00", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1598023696416-0193a0bcd302?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pizza", name="Margherita Pizza", description="Fresh mozzarella, basil, tomatoes or marinara.", price="20.25", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pizza", name="White Pizza", description="Mozzarella, ricotta, garlic, spices.", price="18.00", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1689793605149-8c5c4b6db1cf?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pizza", name="Hot Honey Roni", description="Pepperoni and basil with a hot honey drizzle.", price="21.25", image_emoji="🍯", image_url="https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Subs & Sandwiches", name="Chicken Parmigiana Sub", description="Breaded chicken, fresh mozzarella.", price="10.75", image_emoji="🥪", image_url="https://images.unsplash.com/photo-1777891257610-db6e1a9be7df?auto=format&fit=crop&w=800&q=80"),
            dict(category="Pasta", name="Penne Alla Vodka", description="Penne in a creamy vodka sauce.", price="14.25", image_emoji="🍝", image_url="https://images.unsplash.com/photo-1671442131445-a99f2e59850a?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Frank's Deli & Restaurant",
        town="Asbury Park",
        cuisine="Diner / Deli",
        description="Real Asbury Park institution open since 1960 — breakfast, deli sandwiches, and diner classics.",
        image_emoji="🍳",
        image_url="https://images.unsplash.com/photo-1702460831732-b75fcd58659e?auto=format&fit=crop&w=800&q=80",
        website_url="https://franksdelinj.com/",
        category="deli",
        rating="4.6",
        eta_minutes=20,
        latitude=40.2233,
        longitude=-74.0102,
        price_range="$",
        menu=[
            dict(category="Breakfast", name="Pork Roll, Egg & Cheese", description="Griddled Jersey diner classic.", price="7.49", image_emoji="🥪", image_url="https://images.unsplash.com/photo-1629212274717-59f76381b00b?auto=format&fit=crop&w=800&q=80"),
            dict(category="Breakfast", name="Taylor Ham Bagel", description="Everything bagel, fried egg.", price="7.99", image_emoji="🥯", image_url="https://images.unsplash.com/photo-1727245243403-b177f3670c2e?auto=format&fit=crop&w=800&q=80"),
            dict(category="Deli", name="Frank's Overstuffed Club", description="The house specialty triple-decker club.", price="11.99", image_emoji="🥪", image_url="https://images.unsplash.com/photo-1777891257610-db6e1a9be7df?auto=format&fit=crop&w=800&q=80"),
            dict(category="Bakery", name="Crumb Cake", description="Thick Jersey-style crumb topping.", price="4.99", image_emoji="🍰", image_url="https://images.unsplash.com/photo-1773399159524-8bb2293c5144?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Grilled Cheese & Tomato Soup", description="Classic diner combo.", price="10.99", image_emoji="🧀", image_url="https://images.unsplash.com/photo-1762647420988-5080acf33988?auto=format&fit=crop&w=800&q=80"),
            dict(category="Drinks", name="Diner Coffee", description="Bottomless cup.", price="2.99", image_emoji="☕", image_url="https://images.unsplash.com/photo-1561738788-8a63f045a4d3?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Klein's Fish Market & Waterside Cafe",
        town="Belmar",
        cuisine="Seafood / Waterfront",
        description="Real Belmar waterfront seafood market and cafe, family-run since the 1920s on the Shark River.",
        image_emoji="🦀",
        image_url="https://kleinsfish.com/wp-content/uploads/2024/09/Lobster.gif",
        website_url="https://kleinsfish.com/",
        category="seafood",
        rating="4.5",
        eta_minutes=30,
        latitude=40.1770,
        longitude=-74.0257,
        price_range="$$",
        menu=[
            dict(category="Appetizers", name="Crab Cake Sandwich", description="With crispy waffle fries and coleslaw.", price="14.99", image_emoji="🦀", image_url="https://images.unsplash.com/photo-1760047550367-3d72fa3053c5?auto=format&fit=crop&w=800&q=80"),
            dict(category="Appetizers", name="Clam Chowder", description="New England style, oyster crackers.", price="7.99", image_emoji="🍲", image_url="https://images.unsplash.com/photo-1778600731540-48de5d5ae2fb?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Lobster Roll", description="Fresh lobster meat, butter, New England roll, waffle fries & slaw.", price="30.00", image_emoji="🦞", image_url="https://images.unsplash.com/photo-1761682719764-b49608326fe9?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Fish & Chips", description="Beer-battered, malt vinegar.", price="16.99", image_emoji="🐟", image_url="https://images.unsplash.com/photo-1697748836791-9ddf7e616ece?auto=format&fit=crop&w=800&q=80"),
            dict(category="Desserts", name="Key Lime Pie", description="Graham crust, whipped cream.", price="6.99", image_emoji="🥧", image_url="https://images.unsplash.com/photo-1641848421525-e1da6f1b67aa?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Maruca's Tomato Pies",
        town="Seaside Heights",
        cuisine="Pizza / Boardwalk Classics",
        description="Real Seaside Heights boardwalk institution since 1950 — Trenton-style tomato pies, sauce on top.",
        image_emoji="🎡",
        image_url="https://images.unsplash.com/photo-1598023696416-0193a0bcd302?auto=format&fit=crop&w=800&q=80",
        website_url="https://www.marucaspizza.com/",
        category="pizza",
        rating="4.7",
        eta_minutes=22,
        latitude=39.9377,
        longitude=-74.0729,
        price_range="$",
        menu=[
            dict(category="Tomato Pies", name="18\" Large Tomato Pie", description="Trenton-style, sauce swirled on top.", price="23.00", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1598023696416-0193a0bcd302?auto=format&fit=crop&w=800&q=80"),
            dict(category="Tomato Pies", name="12\" Bar Pie", description="Thin, crispy personal-size pie.", price="13.00", image_emoji="🍕", image_url="https://images.unsplash.com/photo-1689793605149-8c5c4b6db1cf?auto=format&fit=crop&w=800&q=80"),
            dict(category="Boardwalk Classics", name="Funnel Cake", description="Powdered sugar, classic boardwalk treat.", price="7.99", image_emoji="🍥", image_url="https://images.unsplash.com/photo-1645461257081-7fc480c722cd?auto=format&fit=crop&w=800&q=80"),
            dict(category="Sides", name="Mozzarella Sticks", description="Golden fried, marinara.", price="13.00", image_emoji="🧀", image_url="https://images.unsplash.com/photo-1778449665117-2c607bbc7415?auto=format&fit=crop&w=800&q=80"),
            dict(category="Sides", name="Wings", description="Tossed in your choice of sauce.", price="12.00", image_emoji="🍗", image_url="https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Drinks", name="Snow Cone", description="Rainbow, cherry, or blue raspberry.", price="4.49", image_emoji="🍧", image_url="https://images.unsplash.com/photo-1609864517307-7c5234cc38be?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="The Boondocks Fishery",
        town="Red Bank",
        cuisine="Seafood / Raw Bar",
        description="Real Navesink riverfront seafood shack in Red Bank — lobster nights and outdoor waterside dining.",
        image_emoji="🦪",
        image_url="https://images.unsplash.com/photo-1717251752308-2ef72f07484e?auto=format&fit=crop&w=800&q=80",
        website_url="https://theboondocksfishery.com/",
        category="seafood",
        rating="4.5",
        eta_minutes=28,
        latitude=40.3520,
        longitude=-74.0637,
        price_range="$$$",
        menu=[
            dict(category="Appetizers", name="Fried Calamari", description="Crispy calamari, marinara.", price="17.95", image_emoji="🦑", image_url="https://images.unsplash.com/photo-1763467940825-d067fb3baf22?auto=format&fit=crop&w=800&q=80"),
            dict(category="Appetizers", name="Cajun Tuna Bites", description="Blackened ahi, Cajun spice.", price="14.95", image_emoji="🐟", image_url="https://images.unsplash.com/photo-1763467940825-d067fb3baf22?auto=format&fit=crop&w=800&q=80"),
            dict(category="Appetizers", name="Coconut Shrimp", description="Crispy coconut breading.", price="15.95", image_emoji="🍤", image_url="https://images.unsplash.com/photo-1751152841080-dedb3b716b83?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Shrimp Scampi", description="Garlic butter white wine sauce.", price="26.95", image_emoji="🍤", image_url="https://images.unsplash.com/photo-1751152841080-dedb3b716b83?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Fish & Chips", description="Beer-battered, malt vinegar.", price="22.95", image_emoji="🐟", image_url="https://images.unsplash.com/photo-1697748836791-9ddf7e616ece?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Lobster Dinner", description="Whole steamed lobster, drawn butter.", price="36.95", image_emoji="🦞", image_url="https://images.unsplash.com/photo-1761682719764-b49608326fe9?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Galindos Kitchen",
        town="Long Branch",
        cuisine="Mexican",
        description="Real family-owned Long Branch taqueria since 2018 — authentic Mexican cuisine, Taco Tuesday specials.",
        image_emoji="🌮",
        image_url="https://images.unsplash.com/photo-1648437595587-e6a8b0cdf1f9?auto=format&fit=crop&w=800&q=80",
        website_url="https://galindoskitchen.net/",
        category="tacos",
        rating="4.6",
        eta_minutes=24,
        latitude=40.2967,
        longitude=-73.9932,
        price_range="$$",
        menu=[
            dict(category="Tacos", name="Chicken Tacos (4pc)", description="Grilled chicken, cilantro, onion.", price="13.99", image_emoji="🌮", image_url="https://images.unsplash.com/photo-1711989874705-bb85dc205541?auto=format&fit=crop&w=800&q=80"),
            dict(category="Tacos", name="Pastor Tacos (4pc)", description="Al pastor pork, pineapple, cilantro, onion.", price="14.99", image_emoji="🌮", image_url="https://images.unsplash.com/photo-1687881063470-a78e6ea2590e?auto=format&fit=crop&w=800&q=80"),
            dict(category="Tacos", name="Shrimp California Style Tacos (3pc)", description="Grilled shrimp, cabbage slaw, crema.", price="15.99", image_emoji="🌮", image_url="https://images.unsplash.com/photo-1711989874705-bb85dc205541?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Zeke's Carnitas", description="Slow-braised pulled pork, house style.", price="16.99", image_emoji="🌯", image_url="https://images.unsplash.com/photo-1687881063470-a78e6ea2590e?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Classic Burrito", description="Rice, beans, choice of protein.", price="12.99", image_emoji="🌯", image_url="https://images.unsplash.com/photo-1731090389603-d63060ee08a6?auto=format&fit=crop&w=800&q=80"),
            dict(category="Mains", name="Quesadilla", description="Corn tortilla, melted cheese, choice of protein.", price="11.99", image_emoji="🧀", image_url="https://images.unsplash.com/photo-1731090389603-d63060ee08a6?auto=format&fit=crop&w=800&q=80"),
            dict(category="Drinks", name="Horchata", description="Housemade cinnamon rice drink.", price="3.99", image_emoji="🥛", image_url="https://images.unsplash.com/photo-1775264175004-604006f6c8b0?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Sharky's Wings & Raw Bar",
        town="Clifton",
        cuisine="Wings / Sports Bar",
        description="Real Clifton wing joint — bold buffalo wings with 30+ sauces, plus a raw bar. A local favorite.",
        image_emoji="🍗",
        image_url="https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=800&q=80",
        website_url="https://www.sharkyswingsnj.com/",
        category="wings",
        rating="4.5",
        eta_minutes=26,
        latitude=40.8767,
        longitude=-74.1590,
        price_range="$$",
        menu=[
            dict(category="Wings", name="Buffalo Wings (10)", description="Classic buffalo, celery & blue cheese.", price="13.99", image_emoji="🍗", image_url="https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=800&q=80"),
            dict(category="Wings", name="Honey BBQ Wings (10)", description="Sweet and smoky glaze.", price="13.99", image_emoji="🍗", image_url="https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80"),
            dict(category="Wings", name="Garlic Parm Wings (10)", description="Buttery garlic and parmesan.", price="13.99", image_emoji="🧄", image_url="https://images.unsplash.com/photo-1608039755401-742074f0548d?auto=format&fit=crop&w=800&q=80"),
            dict(category="Wings", name="Boneless Wings (12)", description="Your choice of sauce.", price="12.99", image_emoji="🍗", image_url="https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=800&q=80"),
            dict(category="Raw Bar", name="Clams on the Half Shell (6)", description="Freshly shucked, cocktail sauce.", price="11.99", image_emoji="🦪", image_url="https://images.unsplash.com/photo-1717251882176-acdf0d46282c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Sides", name="Loaded Fries", description="Cheese, bacon, scallions.", price="8.99", image_emoji="🍟", image_url="https://images.unsplash.com/photo-1780030827889-b9a2fa9a7748?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Ruthie's Bar-B-Q & Pizza",
        town="Montclair",
        cuisine="BBQ / Barbecue",
        description="Real Montclair pit — slow-smoked brisket, pulled pork, and ribs, with Southern sides.",
        image_emoji="🍖",
        image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
        website_url="https://www.ruthiesbbq.com/",
        category="bbq",
        rating="4.6",
        eta_minutes=30,
        latitude=40.8135,
        longitude=-74.2100,
        price_range="$$",
        menu=[
            dict(category="Smokehouse", name="Chopped Brisket Platter", description="Slow-smoked beef brisket, two sides.", price="18.99", image_emoji="🍖", image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"),
            dict(category="Smokehouse", name="Pulled Pork Sandwich", description="Piled high, on a brioche bun.", price="13.99", image_emoji="🥪", image_url="https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=800&q=80"),
            dict(category="Smokehouse", name="Baby Back Ribs (Full Rack)", description="Fall-off-the-bone, house rub.", price="26.99", image_emoji="🍖", image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80"),
            dict(category="Sides", name="Mac & Cheese", description="Creamy, baked.", price="5.99", image_emoji="🧀", image_url="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80"),
            dict(category="Sides", name="Collard Greens", description="Slow-cooked, Southern style.", price="5.49", image_emoji="🥬", image_url="https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&w=800&q=80"),
            dict(category="Sides", name="Buttermilk Onion Rings", description="Hand-battered, crispy.", price="6.49", image_emoji="🧅", image_url="https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Sushi Lounge",
        town="Totowa",
        cuisine="Sushi / Japanese",
        description="Real Totowa sushi bar — traditional rolls and Asian-fusion plates in an energetic room.",
        image_emoji="🍣",
        image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80",
        website_url="https://www.ilovesushilounge.com/",
        category="sushi",
        rating="4.5",
        eta_minutes=27,
        latitude=40.9010,
        longitude=-74.2230,
        price_range="$$$",
        menu=[
            dict(category="Rolls", name="Spicy Tuna Roll", description="Tuna, spicy mayo, scallion.", price="8.50", image_emoji="🍣", image_url="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Rolls", name="Dragon Roll", description="Eel, cucumber, avocado on top.", price="15.95", image_emoji="🍣", image_url="https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=800&q=80"),
            dict(category="Rolls", name="California Roll", description="Crab, avocado, cucumber.", price="7.50", image_emoji="🍣", image_url="https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=800&q=80"),
            dict(category="Sashimi", name="Salmon Sashimi (5pc)", description="Fresh sliced salmon.", price="12.95", image_emoji="🐟", image_url="https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?auto=format&fit=crop&w=800&q=80"),
            dict(category="Kitchen", name="Chicken Teriyaki", description="Grilled chicken, teriyaki glaze, rice.", price="16.95", image_emoji="🍗", image_url="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Kitchen", name="Edamame", description="Steamed, sea salt.", price="5.50", image_emoji="🫛", image_url="https://images.unsplash.com/photo-1564834744159-ff0ea41ba4b9?auto=format&fit=crop&w=800&q=80"),
        ],
    ),
    dict(
        name="Holsten's Brookdale Confectionery",
        town="Bloomfield",
        cuisine="Dessert / Ice Cream",
        description="Real Bloomfield ice cream parlor since 1939 — homemade ice cream, sundaes, and hand-dipped chocolates (yes, the Sopranos one).",
        image_emoji="🍨",
        image_url="https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=800&q=80",
        website_url="https://holstens.com/",
        category="dessert",
        rating="4.8",
        eta_minutes=22,
        latitude=40.8100,
        longitude=-74.1880,
        price_range="$$",
        menu=[
            dict(category="Sundaes", name="Hot Fudge Sundae", description="Homemade ice cream, hot fudge, whipped cream.", price="8.95", image_emoji="🍨", image_url="https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80"),
            dict(category="Sundaes", name="Banana Split", description="Three scoops, banana, three toppings.", price="10.95", image_emoji="🍌", image_url="https://images.unsplash.com/photo-1533657669987-6d0e8f0a0f0c?auto=format&fit=crop&w=800&q=80"),
            dict(category="Milkshakes", name="Old-Fashioned Milkshake", description="Hand-spun, real ice cream.", price="7.50", image_emoji="🥤", image_url="https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80"),
            dict(category="Ice Cream", name="Two-Scoop Cone", description="Choose from 20+ homemade flavors.", price="5.95", image_emoji="🍦", image_url="https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=800&q=80"),
            dict(category="Chocolates", name="Hand-Dipped Chocolate Box", description="House-made confections, half pound.", price="14.95", image_emoji="🍫", image_url="https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80"),
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
        retired = db.query(Restaurant).filter(Restaurant.name.in_(RETIRED_RESTAURANT_NAMES)).all()
        for restaurant in retired:
            db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).delete()
            db.query(OrderItem).filter(
                OrderItem.order_id.in_(
                    db.query(Order.id).filter(Order.restaurant_id == restaurant.id)
                )
            ).delete(synchronize_session=False)
            db.query(Order).filter(Order.restaurant_id == restaurant.id).delete()
            db.delete(restaurant)
        if retired:
            db.commit()
            print(f"[seed_dev] Retired {len(retired)} replaced demo restaurant(s).")

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
                restaurant.website_url = spec.get("website_url")
                restaurant.category = spec.get("category")
                restaurant.latitude = spec.get("latitude")
                restaurant.longitude = spec.get("longitude")
                restaurant.is_featured = spec.get("is_featured", False)
                db.add(restaurant)
            else:
                restaurant = Restaurant(
                    name=spec["name"],
                    town=spec["town"],
                    cuisine=spec["cuisine"],
                    description=spec["description"],
                    image_emoji=spec["image_emoji"],
                    image_url=spec.get("image_url"),
                    website_url=spec.get("website_url"),
                    category=spec.get("category"),
                    latitude=spec.get("latitude"),
                    longitude=spec.get("longitude"),
                    is_featured=spec.get("is_featured", False),
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
            existing_items_by_name = {
                mi.name: mi
                for mi in db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant.id).all()
            }
            for item_spec in spec["menu"]:
                existing_item = existing_items_by_name.get(item_spec["name"])
                if existing_item:
                    # Sync image_url in place for items seeded before photos existed.
                    existing_item.image_url = item_spec.get("image_url")
                    db.add(existing_item)
                    continue
                db.add(MenuItem(
                    restaurant_id=restaurant.id,
                    category=item_spec["category"],
                    name=item_spec["name"],
                    description=item_spec["description"],
                    price=Decimal(item_spec["price"]),
                    image_emoji=item_spec["image_emoji"],
                    image_url=item_spec.get("image_url"),
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
        print("  uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload")
        print()
        print("Try it:")
        print("  curl http://localhost:8001/api/v1/health")
        print("  curl http://localhost:8001/api/v1/restaurants")
        print(f"  curl http://localhost:8001/api/v1/restaurants/{sample_restaurant_id}")
        print("=" * 60)
    finally:
        db.close()


if __name__ == "__main__":
    main()
