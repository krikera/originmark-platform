"""
Shared test fixtures for OriginMark API tests.

Provides an isolated SQLite in-memory database and a FastAPI TestClient
for each test. Every test gets a clean database — no state leaks.
"""

import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Set test env vars before importing app modules
os.environ["JWT_SECRET_KEY"] = "test-secret-key-for-testing-only"
os.environ["TESTING"] = "true"

from db import Base, get_db
from main import app


# ── Database fixtures ────────────────────────────────────────────────────────

@pytest.fixture()
def db_session():
    """Create a fresh in-memory SQLite database for each test."""
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    """FastAPI TestClient with database dependency overridden."""

    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── Auth helper fixtures ─────────────────────────────────────────────────────

@pytest.fixture()
def registered_user(client):
    """Register a test user and return their data."""
    response = client.post("/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "securepassword123",
    })
    assert response.status_code == 200
    return response.json()


@pytest.fixture()
def auth_token(client, registered_user):
    """Login and return a JWT access token."""
    response = client.post("/auth/login", json={
        "username": "testuser",
        "password": "securepassword123",
    })
    assert response.status_code == 200
    data = response.json()
    return data["access_token"]


@pytest.fixture()
def auth_headers(auth_token):
    """Return Authorization headers with JWT token."""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture()
def api_key(client, auth_headers):
    """Create and return an API key for the test user."""
    response = client.post(
        "/auth/api-keys",
        json={"name": "test-key", "description": "Test API key"},
        headers=auth_headers,
    )
    assert response.status_code == 200
    return response.json()["api_key"]


@pytest.fixture()
def api_key_headers(api_key):
    """Return Authorization headers with API key."""
    return {"Authorization": f"Bearer {api_key}"}


# ── Content fixtures ─────────────────────────────────────────────────────────

@pytest.fixture()
def sample_text_content():
    """Sample text content for signing."""
    return b"This is a test document for OriginMark signing."


@pytest.fixture()
def signed_content(client, sample_text_content):
    """Sign sample content and return the signature response."""
    response = client.post(
        "/sign",
        files={"file": ("test.txt", sample_text_content, "text/plain")},
        data={"author": "Test Author", "model_used": "GPT-4"},
    )
    assert response.status_code == 200
    return response.json()
