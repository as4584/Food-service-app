from decimal import Decimal

NJ_SALES_TAX = Decimal("0.06625")
DELIVERY_FEE = Decimal("3.99")


def test_create_order_computes_tax_and_total(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    response = client.post(
        "/api/v1/orders",
        json={
            "restaurant_id": str(restaurant.id),
            "customer_name": "Test Customer",
            "delivery_address": "1 Test St",
            "items": [{"menu_item_id": str(menu_item.id), "quantity": 2}],
        },
    )
    assert response.status_code == 201
    body = response.json()

    expected_subtotal = Decimal("24.00")  # 2 x $12.00
    expected_tax = (expected_subtotal * NJ_SALES_TAX).quantize(Decimal("0.01"))
    expected_total = expected_subtotal + expected_tax + DELIVERY_FEE

    assert Decimal(body["subtotal"]) == expected_subtotal
    assert Decimal(body["tax"]) == expected_tax
    assert Decimal(body["delivery_fee"]) == DELIVERY_FEE
    assert Decimal(body["total"]) == expected_total
    assert body["restaurant_name"] == restaurant.name


def test_create_order_unknown_restaurant_404(client):
    response = client.post(
        "/api/v1/orders",
        json={
            "restaurant_id": "00000000-0000-0000-0000-000000000000",
            "items": [{"menu_item_id": "00000000-0000-0000-0000-000000000001", "quantity": 1}],
        },
    )
    assert response.status_code == 404


def test_create_order_unknown_menu_item_404(client, seeded_restaurant):
    restaurant, _ = seeded_restaurant
    response = client.post(
        "/api/v1/orders",
        json={
            "restaurant_id": str(restaurant.id),
            "items": [{"menu_item_id": "00000000-0000-0000-0000-000000000000", "quantity": 1}],
        },
    )
    assert response.status_code == 404


def test_get_order_roundtrip(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    create_response = client.post(
        "/api/v1/orders",
        json={
            "restaurant_id": str(restaurant.id),
            "items": [{"menu_item_id": str(menu_item.id), "quantity": 1}],
        },
    )
    order_id = create_response.json()["id"]

    get_response = client.get(f"/api/v1/orders/{order_id}")
    assert get_response.status_code == 200
    body = get_response.json()
    assert body["id"] == order_id
    assert body["stage"] == "placed"
    assert body["stage_index"] == 0
