"""
Tests for authentication — registration, login, JWT, and API key management.

Covers:
    - User registration (success + duplicate handling)
    - Login with JWT token response
    - JWT-protected API key CRUD
    - Auth failures (bad password, expired token, etc.)
"""

from dependencies import decode_access_token


class TestRegistration:
    """Tests for POST /auth/register"""

    def test_register_success(self, client):
        """Register a new user successfully."""
        response = client.post("/auth/register", json={
            "email": "new@example.com",
            "username": "newuser",
            "password": "password123",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "User registered successfully"
        assert "user_id" in data

    def test_register_duplicate_email(self, client, registered_user):
        """Duplicate email should be rejected."""
        response = client.post("/auth/register", json={
            "email": "test@example.com",  # Same as registered_user
            "username": "different",
            "password": "password123",
        })
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_register_duplicate_username(self, client, registered_user):
        """Duplicate username should be rejected."""
        response = client.post("/auth/register", json={
            "email": "different@example.com",
            "username": "testuser",  # Same as registered_user
            "password": "password123",
        })
        assert response.status_code == 400


class TestLogin:
    """Tests for POST /auth/login"""

    def test_login_success_returns_jwt(self, client, registered_user):
        """Login should return a JWT access token."""
        response = client.post("/auth/login", json={
            "username": "testuser",
            "password": "securepassword123",
        })
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Login successful"
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["username"] == "testuser"

    def test_login_with_email(self, client, registered_user):
        """Login should also work with email instead of username."""
        response = client.post("/auth/login", json={
            "username": "test@example.com",
            "password": "securepassword123",
        })
        assert response.status_code == 200
        assert "access_token" in response.json()

    def test_login_wrong_password(self, client, registered_user):
        """Wrong password should return 401."""
        response = client.post("/auth/login", json={
            "username": "testuser",
            "password": "wrongpassword",
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Non-existent user should return 401."""
        response = client.post("/auth/login", json={
            "username": "nobody",
            "password": "anything",
        })
        assert response.status_code == 401

    def test_jwt_token_is_valid(self, client, registered_user):
        """JWT token from login should be decodable."""
        response = client.post("/auth/login", json={
            "username": "testuser",
            "password": "securepassword123",
        })
        token = response.json()["access_token"]
        payload = decode_access_token(token)
        assert payload["sub"] == registered_user["user_id"]
        assert payload["username"] == "testuser"


class TestAPIKeyManagement:
    """Tests for /auth/api-keys (JWT-protected)"""

    def test_create_api_key(self, client, auth_headers):
        """Create an API key with JWT auth."""
        response = client.post(
            "/auth/api-keys",
            json={"name": "my-key", "description": "Test key"},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["api_key"].startswith("om_")
        assert data["name"] == "my-key"

    def test_list_api_keys(self, client, auth_headers):
        """List API keys — should include created keys."""
        # Create a key first
        client.post(
            "/auth/api-keys",
            json={"name": "list-test-key"},
            headers=auth_headers,
        )

        response = client.get("/auth/api-keys", headers=auth_headers)
        assert response.status_code == 200
        keys = response.json()["api_keys"]
        assert len(keys) >= 1
        assert any(k["name"] == "list-test-key" for k in keys)

    def test_revoke_api_key(self, client, auth_headers):
        """Revoke an API key."""
        # Create
        create_resp = client.post(
            "/auth/api-keys",
            json={"name": "revoke-me"},
            headers=auth_headers,
        )
        key_id = create_resp.json()["key_id"]

        # Revoke
        revoke_resp = client.delete(
            f"/auth/api-keys/{key_id}",
            headers=auth_headers,
        )
        assert revoke_resp.status_code == 200

        # Should no longer appear in list
        list_resp = client.get("/auth/api-keys", headers=auth_headers)
        keys = list_resp.json()["api_keys"]
        assert not any(k["id"] == key_id for k in keys)

    def test_api_key_requires_jwt(self, client):
        """API key endpoints should reject unauthenticated requests."""
        response = client.get("/auth/api-keys")
        assert response.status_code in (401, 403)

    def test_api_key_rejects_api_key_auth(self, client, api_key_headers):
        """API key management endpoints require JWT, not API key."""
        response = client.get("/auth/api-keys", headers=api_key_headers)
        assert response.status_code == 401
        assert "JWT" in response.json()["detail"]


class TestJWTSecurity:
    """Tests for JWT token security."""

    def test_expired_token_rejected(self, client, registered_user):
        """Expired JWT tokens should be rejected."""
        from datetime import datetime, timedelta, timezone

        import jwt as pyjwt

        from dependencies import JWT_ALGORITHM, JWT_SECRET_KEY

        # Create an already-expired token
        expired_payload = {
            "sub": registered_user["user_id"],
            "username": "testuser",
            "iat": datetime.now(timezone.utc) - timedelta(hours=48),
            "exp": datetime.now(timezone.utc) - timedelta(hours=1),
        }
        expired_token = pyjwt.encode(expired_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)

        response = client.get(
            "/auth/api-keys",
            headers={"Authorization": f"Bearer {expired_token}"},
        )
        assert response.status_code == 401
        assert "expired" in response.json()["detail"].lower()

    def test_invalid_token_rejected(self, client):
        """Garbage tokens should be rejected."""
        response = client.get(
            "/auth/api-keys",
            headers={"Authorization": "Bearer not.a.valid.jwt.token"},
        )
        assert response.status_code == 401

    def test_tampered_token_rejected(self, client, auth_token):
        """Tampered JWT tokens should be rejected."""
        # Modify the token slightly
        tampered = auth_token[:-5] + "XXXXX"
        response = client.get(
            "/auth/api-keys",
            headers={"Authorization": f"Bearer {tampered}"},
        )
        assert response.status_code == 401
