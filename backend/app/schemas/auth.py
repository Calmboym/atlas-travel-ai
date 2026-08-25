"""Pydantic request/response schemas for authentication endpoints.

ADDED — ATLAS-P1-AUTH-02 (Register*), ATLAS-P1-AUTH-05 (Login*,
TokenResponse), ATLAS-P1-AUTH-04 (VerifyEmail*, ResendVerification*),
ATLAS-P1-AUTH-07 (RefreshResponse — GET /auth/me and POST /auth/logout
return existing schemas / no body, so neither needs a new one here).
ATLAS-P1-AUTH-06 (ForgotPassword*, ResetPassword*).
ATLAS-P1-AUTH-08: UserResponse.role.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app.models.user import UserRole


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()

    @field_validator("password")
    @classmethod
    def validate_password_byte_length(cls, value: str) -> str:
        # bcrypt silently truncates beyond 72 bytes; reject rather than
        # silently accept a password that isn't fully honored.
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes long.")
        return value


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    is_verified: bool
    created_at: datetime
    role: UserRole  # ADDED — ATLAS-P1-AUTH-08


class RegisterResponse(BaseModel):
    user: UserResponse
    message: str = "Registration successful. Please check your email to verify your account."


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class VerifyEmailRequest(BaseModel):
    token: str = Field(min_length=1)


class VerifyEmailResponse(BaseModel):
    message: str
    user: UserResponse


class ResendVerificationRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=1)
    new_password: str = Field(min_length=8)

    @field_validator("new_password")
    @classmethod
    def validate_password_byte_length(cls, value: str) -> str:
        # Same bcrypt 72-byte limit RegisterRequest.password enforces.
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 bytes long.")
        return value


class ResetPasswordResponse(BaseModel):
    message: str
    user: UserResponse
