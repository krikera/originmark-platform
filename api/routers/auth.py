"""
OriginMark API — Authentication & API Key Management Router.

Endpoints:
    POST /auth/register      — Register a new user
    POST /auth/login         — Authenticate and return JWT token
    POST /auth/api-keys      — Create a new API key (JWT required)
    GET  /auth/api-keys      — List user's API keys (JWT required)
    DELETE /auth/api-keys/{id} — Revoke an API key (JWT required)
"""

import uuid
from typing import Optional

import bcrypt
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from db import APIKey, User, generate_api_key, get_db, hash_api_key
from dependencies import create_access_token, get_current_user, limiter, verify_password

router = APIRouter(prefix="/auth", tags=["auth"])


# ── Pydantic models ─────────────────────────────────────────────────────────

class CreateUserRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_-]+$")
    password: str = Field(..., min_length=8, max_length=128)


class LoginRequest(BaseModel):
    username: str
    password: str


class CreateAPIKeyRequest(BaseModel):
    name: str
    description: Optional[str] = None
    rate_limit: Optional[int] = 1000


# ── Endpoints ────────────────────────────────────────────────────────────────

@router.post("/register")
async def register_user(user_data: CreateUserRequest, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # Hash password using bcrypt (industry-standard secure password hashing)
    # bcrypt automatically handles salting and uses a work factor for computational cost
    password_hash = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt()).decode()

    # Create user
    user_id = str(uuid.uuid4())
    new_user = User(
        id=user_id,
        email=user_data.email,
        username=user_data.username,
        password_hash=password_hash,
    )

    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully", "user_id": user_id}


@router.post("/login")
@limiter.limit("5/minute")
async def login_user(request: Request, login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT access token."""
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == login_data.username) | (User.email == login_data.username)
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password using bcrypt
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate JWT token
    access_token = create_access_token(user.id, user.username)

    # Check if user has API keys
    has_api_key = db.query(APIKey).filter(
        APIKey.user_id == user.id,
        APIKey.is_active == True,
    ).first() is not None

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "has_api_key": has_api_key,
    }


# ── API Key Management (JWT-protected) ───────────────────────────────────────

@router.post("/api-keys")
async def create_api_key(
    key_data: CreateAPIKeyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new API key for the authenticated user."""
    # Generate API key
    api_key = generate_api_key()
    key_hash = hash_api_key(api_key)

    # Create API key record
    key_id = str(uuid.uuid4())
    new_key = APIKey(
        id=key_id,
        user_id=current_user.id,
        key_hash=key_hash,
        name=key_data.name,
        description=key_data.description,
        rate_limit=key_data.rate_limit,
    )

    db.add(new_key)
    db.commit()

    return {
        "message": "API key created successfully",
        "api_key": api_key,  # Only shown once
        "key_id": key_id,
        "name": key_data.name,
    }


@router.get("/api-keys")
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all API keys for the authenticated user."""
    keys = db.query(APIKey).filter(
        APIKey.user_id == current_user.id,
        APIKey.is_active == True,
    ).all()

    return {
        "api_keys": [
            {
                "id": key.id,
                "name": key.name,
                "description": key.description,
                "created_at": key.created_at.isoformat(),
                "last_used": key.last_used.isoformat() if key.last_used else None,
                "usage_count": key.usage_count,
                "rate_limit": key.rate_limit,
            }
            for key in keys
        ]
    }


@router.delete("/api-keys/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke an API key owned by the authenticated user."""
    api_key = db.query(APIKey).filter(
        APIKey.id == key_id,
        APIKey.user_id == current_user.id,
    ).first()

    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")

    api_key.is_active = False
    db.commit()

    return {"message": "API key revoked successfully"}
