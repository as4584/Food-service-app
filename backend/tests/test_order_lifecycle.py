"""Tests for the real order lifecycle: merchant + driver transitions.

These lock in the state machine so a future refactor can't silently allow an
illegal move (e.g. delivering an order the restaurant never accepted) or drop
the driver/rejection fields off the response.
"""


def _place_order(client, restaurant, menu_item, qty=1):
    resp = client.post(
        "/api/v1/orders",
        json={
            "restaurant_id": str(restaurant.id),
            "items": [{"menu_item_id": str(menu_item.id), "quantity": qty}],
        },
    )
    assert resp.status_code == 201
    return resp.json()


def test_new_order_starts_pending(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    order = _place_order(client, restaurant, menu_item)
    assert order["status"] == "pending"
    assert order["rejected"] is False
    assert order["driver_name"] is None
    assert order["stage_index"] == 0


def test_happy_path_accept_ready_pickup_deliver(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    order = _place_order(client, restaurant, menu_item)
    oid = order["id"]

    accepted = client.post(f"/api/v1/orders/{oid}/accept").json()
    assert accepted["status"] == "accepted"
    assert accepted["stage_index"] == 1

    ready = client.post(f"/api/v1/orders/{oid}/ready").json()
    assert ready["status"] == "ready"

    picked = client.post(
        f"/api/v1/orders/{oid}/pickup", json={"driver_name": "Tony D."}
    ).json()
    assert picked["status"] == "out_for_delivery"
    assert picked["driver_name"] == "Tony D."
    assert picked["stage_index"] == 2

    delivered = client.post(f"/api/v1/orders/{oid}/deliver").json()
    assert delivered["status"] == "delivered"
    assert delivered["is_delivered"] is True
    assert delivered["stage_index"] == 3


def test_reject_sets_reason_and_is_terminal(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    order = _place_order(client, restaurant, menu_item)
    oid = order["id"]

    rejected = client.post(
        f"/api/v1/orders/{oid}/reject", json={"reason": "Closing early tonight"}
    ).json()
    assert rejected["status"] == "rejected"
    assert rejected["rejected"] is True
    assert rejected["rejected_reason"] == "Closing early tonight"

    # A rejected order cannot then be accepted.
    conflict = client.post(f"/api/v1/orders/{oid}/accept")
    assert conflict.status_code == 409


def test_cannot_deliver_before_pickup(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    order = _place_order(client, restaurant, menu_item)
    oid = order["id"]
    # pending -> deliver is illegal
    assert client.post(f"/api/v1/orders/{oid}/deliver").status_code == 409
    # even after accept, still illegal to jump straight to delivered
    client.post(f"/api/v1/orders/{oid}/accept")
    assert client.post(f"/api/v1/orders/{oid}/deliver").status_code == 409


def test_pickup_requires_ready(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    order = _place_order(client, restaurant, menu_item)
    oid = order["id"]
    # Cannot pick up a pending order.
    resp = client.post(f"/api/v1/orders/{oid}/pickup", json={"driver_name": "X"})
    assert resp.status_code == 409


def test_list_filters_by_restaurant_and_status(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    o1 = _place_order(client, restaurant, menu_item)
    o2 = _place_order(client, restaurant, menu_item)
    client.post(f"/api/v1/orders/{o1['id']}/accept")
    client.post(f"/api/v1/orders/{o1['id']}/ready")

    # All orders for this restaurant.
    all_for_r = client.get(f"/api/v1/orders?restaurant_id={restaurant.id}").json()
    ids = {o["id"] for o in all_for_r}
    assert {o1["id"], o2["id"]}.issubset(ids)

    # Only the ready one shows up for a driver polling available deliveries.
    ready = client.get("/api/v1/orders?status=ready").json()
    ready_ids = {o["id"] for o in ready}
    assert o1["id"] in ready_ids
    assert o2["id"] not in ready_ids


def test_active_only_excludes_delivered_and_rejected(client, seeded_restaurant):
    restaurant, menu_item = seeded_restaurant
    o = _place_order(client, restaurant, menu_item)
    oid = o["id"]
    client.post(f"/api/v1/orders/{oid}/reject")

    active = client.get(
        f"/api/v1/orders?restaurant_id={restaurant.id}&active_only=true"
    ).json()
    assert oid not in {x["id"] for x in active}
