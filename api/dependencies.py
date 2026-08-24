"""
OriginMark API — Shared dependencies and utilities.

Authentication helpers, cryptographic utilities, and common dependencies
used across all routers.

Supports two auth methods:
  1. JWT Bearer token — for user sessions (login → token → use)
  2. API key (om_ prefix) — for programmatic access
"""

import hashlib
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
import jwt
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from db import get_db, APIKey, User, hash_api_key


# ── Configuration ────────────────────────────────────────────────────────────

# JWT secret
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "originmark-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", "24"))

# Shared security scheme (accepts both JWT and API key tokens)
security = HTTPBearer(auto_error=False)


# ── JWT Utilities ────────────────────────────────────────────────────────────

def create_access_token(user_id: str, username: str) -> str:
    """Create a JWT access token for a user."""
    payload = {
        "sub": user_id,
        "username": username,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Decode and validate a JWT token. Raises HTTPException on failure."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ── Auth Dependencies ────────────────────────────────────────────────────────

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate the current user from a JWT token (required).

    Use this dependency on endpoints that need the authenticated user's identity.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials

    # JWT tokens are not prefixed with om_
    if token.startswith("om_"):
        raise HTTPException(
            status_code=401,
            detail="This endpoint requires JWT authentication, not an API key",
        )

    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found or inactive")

    return user


async def get_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> APIKey:
    """Authenticate using API key (required)."""
    if not credentials:
        raise HTTPException(status_code=401, detail="API key required")

    api_key = credentials.credentials
    if not api_key.startswith("om_"):
        raise HTTPException(status_code=401, detail="Invalid API key format")

    # Hash the provided key
    key_hash = hash_api_key(api_key)

    # Find the API key in database
    db_key = (
        db.query(APIKey)
        .filter(APIKey.key_hash == key_hash, APIKey.is_active == True)
        .first()
    )

    if not db_key:
        raise HTTPException(status_code=401, detail="Invalid or inactive API key")

    # Update usage statistics
    db_key.last_used = datetime.now(timezone.utc)
    db_key.usage_count += 1
    db.commit()

    return db_key


async def get_optional_api_key(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> APIKey | None:
    """Optionally authenticate using API key."""
    if not credentials:
        return None

    try:
        return await get_api_key(credentials, db)
    except HTTPException:
        return None


async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> str:
    """Extract user_id from either JWT token or API key.

    Supports both auth methods — use this on endpoints that should
    accept either JWT or API key authentication.
    """
    if not credentials:
        raise HTTPException(status_code=401, detail="Authentication required")

    token = credentials.credentials

    # Try API key first (prefixed with om_)
    if token.startswith("om_"):
        key_hash = hash_api_key(token)
        db_key = (
            db.query(APIKey)
            .filter(APIKey.key_hash == key_hash, APIKey.is_active == True)
            .first()
        )
        if not db_key:
            raise HTTPException(status_code=401, detail="Invalid or inactive API key")
        db_key.last_used = datetime.now(timezone.utc)
        db_key.usage_count += 1
        db.commit()
        return db_key.user_id

    # Otherwise try JWT
    payload = decode_access_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")
    return user_id


# ── Password Utilities ───────────────────────────────────────────────────────

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode(), hashed_password.encode())


def compute_hash(content: bytes) -> str:
    """Compute SHA256 hash of content."""
    return hashlib.sha256(content).hexdigest()
