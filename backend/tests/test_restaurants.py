"""
Regression coverage for the restaurant endpoints.

The anchor test here — test_list_and_detail_field_parity — exists because the
single-restaurant detail endpoint builds its response by hand-listing fields
instead of passing the ORM object straight to the schema. That shape lets a
newly-added column (website_url) get added to the model/schema/list endpoint
while silently staying null on the detail endpoint. This test fails loudly
if the two endpoints ever disagree about a shared field again.
"""


def test_list_includes_restaurant(client, seeded_restaurant):
    restaurant, _ = seeded_restaurant
    response = client.get("/api/v1/restaurants")
    assert response.status_code == 200
    names = [r["name"] for r in response.json()]
    assert "Test Pizzeria" in names


def test_list_and_detail_field_parity(client, seeded_restaurant):
    restaurant, _ = seeded_restaurant

    list_response = client.get("/api/v1/restaurants")
    assert list_response.status_code == 200
    list_item = next(r for r in list_response.json() if r["id"] == str(restaurant.id))

    detail_response = client.get(f"/api/v1/restaurants/{restaurant.id}")
    assert detail_response.status_code == 200
    detail = detail_response.json()

    # Every field the list endpoint exposes must appear, unchanged, on the
    # detail endpoint for the same restaurant.
    for field, value in list_item.items():
        assert detail[field] == value, f"{field} differs between list and detail: {value!r} != {detail[field]!r}"


def test_detail_includes_menu_items(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    response = client.get(f"/api/v1/restaurants/{restaurant.id}")
    assert response.status_code == 200
    items = response.json()["menu_items"]
    assert any(item["name"] == "Cheese Pizza" for item in items)


def test_detail_404_for_unknown_id(client):
    response = client.get("/api/v1/restaurants/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404
