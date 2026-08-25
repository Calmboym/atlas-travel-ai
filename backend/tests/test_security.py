"""Unit tests for password hashing and JWT helpers.

ADDED — ATLAS-P1-AUTH-02 (hashing), ATLAS-P1-AUTH-05 (JWT).
EXTENDED — ATLAS-P1-AUTH-07: decode_access_token now returns
AccessTokenPayload (user_id + jti) instead of a bare UUID.
No HTTP layer, no database — pure function tests.
"""

import uuid
from datetime import datetime, timedelta, timezone

import jwt

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password


def test_hash_password_produces_different_hash_each_time() -> None:
    hash_one = hash_password("samepassword123")
    hash_two = hash_password("samepassword123")
    assert hash_one != hash_two  # random salt per call


def test_verify_password_correct() -> None:
    hashed = hash_password("correcthorse")
    assert verify_password("correcthorse", hashed) is True


def test_verify_password_incorrect() -> None:
    hashed = hash_password("correcthorse")
    assert verify_password("wrongpassword", hashed) is False


def test_verify_password_malformed_hash_returns_false_not_raise() -> None:
    assert verify_password("anything", "not-a-real-bcrypt-hash") is False


def test_create_and_decode_access_token_roundtrip() -> None:
    user_id = uuid.uuid4()
    token, jti = create_access_token(user_id)
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.user_id == user_id
    assert payload.jti == jti


def test_create_access_token_uses_supplied_jti_not_a_generated_one() -> None:
    user_id = uuid.uuid4()
    supplied_jti = uuid.uuid4()
    token, returned_jti = create_access_token(user_id, jti=supplied_jti)
    assert returned_jti == supplied_jti
    payload = decode_access_token(token)
    assert payload is not None
    assert payload.jti == supplied_jti


def test_create_access_token_without_jti_generates_a_random_one() -> None:
    user_id = uuid.uuid4()
    _token_one, jti_one = create_access_token(user_id)
    _token_two, jti_two = create_access_token(user_id)
    assert jti_one != jti_two


def test_decode_expired_token_returns_none() -> None:
    user_id = uuid.uuid4()
    token, _jti = create_access_token(user_id, expires_delta=timedelta(seconds=-1))
    assert decode_access_token(token) is None


def test_decode_garbage_token_returns_none() -> None:
    assert decode_access_token("not.a.jwt") is None


def test_decode_token_signed_with_different_secret_returns_none() -> None:
    payload = {
        "sub": str(uuid.uuid4()),
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(minutes=5),
    }
    forged = jwt.encode(payload, "a-completely-different-secret-key-value", algorithm="HS256")
    assert decode_access_token(forged) is None
