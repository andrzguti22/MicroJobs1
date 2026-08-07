import re

from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional

# Misma regla que ya se exige en el frontend (Register.jsx):
# mínimo 6 caracteres, al menos una mayúscula y un número.
PASSWORD_REGEX = re.compile(r"^(?=.*[A-Z])(?=.*\d).{6,}$")


def validate_strong_password(value: str) -> str:
    if not PASSWORD_REGEX.match(value):
        raise ValueError(
            "La contraseña debe tener mínimo 6 caracteres, "
            "al menos una mayúscula y un número"
        )
    return value


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_strength(cls, value):
        return validate_strong_password(value)

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, value):
        value = value.strip()
        if not value:
            raise ValueError("El nombre no puede estar vacío")
        return value


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    city: Optional[str] = None
    phone: Optional[str] = None
    experience: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, value):
        return validate_strong_password(value)