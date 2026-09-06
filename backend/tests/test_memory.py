"""Tests for GET/PATCH /memory/me and DELETE /memory/me/{key}.

ADDED — ATLAS-P1-MEM-02.
"""

from httpx import AsyncClient

_EMAIL = "memory-user@example.com"
_PASSWORD = "longenough1"


async def _register_and_login(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD})
    await client.post("/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD})


# --- Authentication gate ------------------------------------------------


async def test_get_memory_requires_authentication(client: AsyncClient) -> None:
    response = await client.get("/api/v1/memory/me")
    assert response.status_code == 401


async def test_patch_memory_requires_authentication(client: AsyncClient) -> None:
    response = await client.patch("/api/v1/memory/me", json={"data": {"prefers_trains": True}})
    assert response.status_code == 401


async def test_delete_memory_key_requires_authentication(client: AsyncClient) -> None:
    response = await client.delete("/api/v1/memory/me/prefers_trains")
    assert response.status_code == 401


# --- GET: get-or-create --------------------------------------------------


async def test_get_memory_creates_empty_store_on_first_access(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.get("/api/v1/memory/me")
    assert response.status_code == 200
    body = response.json()
    assert body["data"] == {}
    assert "id" in body and "user_id" in body


async def test_get_memory_is_idempotent_same_row(client: AsyncClient) -> None:
    await _register_and_login(client)
    first = await client.get("/api/v1/memory/me")
    second = await client.get("/api/v1/memory/me")
    assert first.json()["id"] == second.json()["id"]


# --- PATCH: shallow merge --------------------------------------------------


async def test_patch_stores_new_entries(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.patch(
        "/api/v1/memory/me", json={"data": {"prefers_trains": True, "budget_hint": "under_2000"}}
    )
    assert response.status_code == 200
    assert response.json()["data"] == {"prefers_trains": True, "budget_hint": "under_2000"}


async def test_patch_merges_without_dropping_other_keys(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/memory/me", json={"data": {"a": 1, "b": 2}})
    response = await client.patch("/api/v1/memory/me", json={"data": {"c": 3}})
    assert response.status_code == 200
    assert response.json()["data"] == {"a": 1, "b": 2, "c": 3}


async def test_patch_overwrites_an_existing_key(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/memory/me", json={"data": {"pace": "relaxed"}})
    response = await client.patch("/api/v1/memory/me", json={"data": {"pace": "packed"}})
    assert response.status_code == 200
    assert response.json()["data"]["pace"] == "packed"


async def test_patch_accepts_nested_and_list_values(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.patch(
        "/api/v1/memory/me",
        json={"data": {"favorite_cuisines": ["italian", "japanese"], "nested": {"x": 1}}},
    )
    assert response.status_code == 200
    body = response.json()["data"]
    assert body["favorite_cuisines"] == ["italian", "japanese"]
    assert body["nested"] == {"x": 1}


async def test_patch_empty_data_is_a_no_op(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/memory/me", json={"data": {"pace": "relaxed"}})
    response = await client.patch("/api/v1/memory/me", json={"data": {}})
    assert response.status_code == 200
    assert response.json()["data"] == {"pace": "relaxed"}


async def test_patch_missing_data_field_defaults_to_empty_and_is_a_no_op(
    client: AsyncClient,
) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/memory/me", json={"data": {"pace": "relaxed"}})
    response = await client.patch("/api/v1/memory/me", json={})
    assert response.status_code == 200
    assert response.json()["data"] == {"pace": "relaxed"}


# --- DELETE: single key ----------------------------------------------------


async def test_delete_removes_a_single_key(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/memory/me", json={"data": {"a": 1, "b": 2}})
    response = await client.delete("/api/v1/memory/me/a")
    assert response.status_code == 200
    assert response.json()["data"] == {"b": 2}


async def test_delete_nonexistent_key_is_idempotent(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/memory/me", json={"data": {"a": 1}})
    response = await client.delete("/api/v1/memory/me/never-set")
    assert response.status_code == 200
    assert response.json()["data"] == {"a": 1}


# --- Isolation --------------------------------------------------------------


async def test_memory_is_isolated_per_user(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json={"email": "user-a@example.com", "password": _PASSWORD})
    await client.post("/api/v1/auth/login", json={"email": "user-a@example.com", "password": _PASSWORD})
    await client.patch("/api/v1/memory/me", json={"data": {"prefers_trains": True}})
    await client.post("/api/v1/auth/logout")

    await client.post("/api/v1/auth/register", json={"email": "user-b@example.com", "password": _PASSWORD})
    await client.post("/api/v1/auth/login", json={"email": "user-b@example.com", "password": _PASSWORD})
    response = await client.get("/api/v1/memory/me")
    assert response.status_code == 200
    assert response.json()["data"] == {}
