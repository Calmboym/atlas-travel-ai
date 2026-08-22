"""Unit tests for password hashing and JWT helpers.

ADDED — ATLAS-P1-AUTH-02 (hashing), ATLAS-P1-AUTH-05 (JWT).
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
    token = create_access_token(user_id)
    assert decode_access_token(token) == user_id


def test_decode_expired_token_returns_none() -> None:
    user_id = uuid.uuid4()
    token = create_access_token(user_id, expires_delta=timedelta(seconds=-1))
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
