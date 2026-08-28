"""Tests for GET /profile/me and PATCH /profile/me.

ADDED — ATLAS-P1-PROF-02.
"""

from httpx import AsyncClient

_EMAIL = "profile-user@example.com"
_PASSWORD = "longenough1"


async def _register_and_login(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json={"email": _EMAIL, "password": _PASSWORD})
    await client.post("/api/v1/auth/login", json={"email": _EMAIL, "password": _PASSWORD})


# --- Authentication gate ------------------------------------------------


async def test_get_profile_requires_authentication(client: AsyncClient) -> None:
    response = await client.get("/api/v1/profile/me")
    assert response.status_code == 401


async def test_patch_profile_requires_authentication(client: AsyncClient) -> None:
    response = await client.patch("/api/v1/profile/me", json={"full_name": "Someone"})
    assert response.status_code == 401


# --- GET: get-or-create --------------------------------------------------


async def test_get_profile_creates_empty_profile_on_first_access(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.get("/api/v1/profile/me")
    assert response.status_code == 200
    body = response.json()
    assert body["full_name"] is None
    assert body["travel_preference"] is None
    assert body["food_preferences"] is None
    assert "id" in body and "user_id" in body


async def test_get_profile_is_idempotent_same_row(client: AsyncClient) -> None:
    await _register_and_login(client)
    first = await client.get("/api/v1/profile/me")
    second = await client.get("/api/v1/profile/me")
    assert first.json()["id"] == second.json()["id"]


# --- PATCH: partial update -------------------------------------------------


async def test_patch_updates_personal_info_fields(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.patch(
        "/api/v1/profile/me",
        json={"full_name": "Ada Lovelace", "country": "United Kingdom", "timezone": "Europe/London"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["full_name"] == "Ada Lovelace"
    assert body["country"] == "United Kingdom"
    assert body["timezone"] == "Europe/London"


async def test_patch_updates_enum_preference_fields(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.patch(
        "/api/v1/profile/me",
        json={
            "travel_preference": "adventure",
            "budget_level": "premium",
            "accommodation_preference": "hotel",
            "transportation_preference": "flight",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["travel_preference"] == "adventure"
    assert body["budget_level"] == "premium"
    assert body["accommodation_preference"] == "hotel"
    assert body["transportation_preference"] == "flight"


async def test_patch_rejects_invalid_enum_value(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.patch("/api/v1/profile/me", json={"travel_preference": "not-a-real-value"})
    assert response.status_code == 422


async def test_patch_accepts_multiple_food_preferences(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.patch(
        "/api/v1/profile/me", json={"food_preferences": ["vegetarian", "allergies"]}
    )
    assert response.status_code == 200
    assert sorted(response.json()["food_preferences"]) == ["allergies", "vegetarian"]


async def test_patch_rejects_invalid_food_preference(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.patch("/api/v1/profile/me", json={"food_preferences": ["pescatarian"]})
    assert response.status_code == 422


async def test_patch_deduplicates_food_preferences(client: AsyncClient) -> None:
    await _register_and_login(client)
    response = await client.patch(
        "/api/v1/profile/me", json={"food_preferences": ["vegan", "vegan", "halal"]}
    )
    assert response.status_code == 200
    assert sorted(response.json()["food_preferences"]) == ["halal", "vegan"]


async def test_patch_is_partial_omitted_fields_unchanged(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/profile/me", json={"full_name": "Grace Hopper", "country": "USA"})
    # Second call only sends `country` — `full_name` must survive untouched.
    response = await client.patch("/api/v1/profile/me", json={"country": "Canada"})
    assert response.status_code == 200
    body = response.json()
    assert body["full_name"] == "Grace Hopper"
    assert body["country"] == "Canada"


async def test_patch_explicit_null_clears_a_field(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/profile/me", json={"full_name": "Temporary Name"})
    response = await client.patch("/api/v1/profile/me", json={"full_name": None})
    assert response.status_code == 200
    assert response.json()["full_name"] is None


async def test_patch_empty_body_is_a_no_op(client: AsyncClient) -> None:
    await _register_and_login(client)
    await client.patch("/api/v1/profile/me", json={"full_name": "Stays The Same"})
    response = await client.patch("/api/v1/profile/me", json={})
    assert response.status_code == 200
    assert response.json()["full_name"] == "Stays The Same"


async def test_profile_is_isolated_per_user(client: AsyncClient) -> None:
    await client.post("/api/v1/auth/register", json={"email": "user-a@example.com", "password": _PASSWORD})
    await client.post("/api/v1/auth/login", json={"email": "user-a@example.com", "password": _PASSWORD})
    await client.patch("/api/v1/profile/me", json={"full_name": "User A"})
    await client.post("/api/v1/auth/logout")

    await client.post("/api/v1/auth/register", json={"email": "user-b@example.com", "password": _PASSWORD})
    await client.post("/api/v1/auth/login", json={"email": "user-b@example.com", "password": _PASSWORD})
    response = await client.get("/api/v1/profile/me")
    assert response.status_code == 200
    assert response.json()["full_name"] is None
