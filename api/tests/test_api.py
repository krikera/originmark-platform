"""
Tests for the root endpoint and general API behavior.
"""


class TestRoot:
    """Tests for GET /"""

    def test_root_returns_200(self, client):
        """Root endpoint should return 200 with API info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "OriginMark" in data["message"]

    def test_process_time_header(self, client):
        """All responses should include X-Process-Time header."""
        response = client.get("/")
        assert "x-process-time" in response.headers


class TestMySignatures:
    """Tests for GET /me/signatures (JWT or API key protected)"""

    def test_get_my_signatures_with_jwt(self, client, auth_headers, sample_text_content, auth_token):
        """Authenticated user can list their own signatures."""
        # Sign something with API key first (need api key for signing with user context)
        # For now just check the endpoint works
        response = client.get("/me/signatures", headers=auth_headers)
        # JWT auth should work via get_current_user_id
        assert response.status_code == 200
        data = response.json()
        assert "signatures" in data

    def test_get_my_signatures_unauthenticated(self, client):
        """Unauthenticated access should be rejected."""
        response = client.get("/me/signatures")
        assert response.status_code in (401, 403)

    def test_get_user_signatures_route(self, client, auth_headers, auth_token):
        """Documented GET /users/{user_id}/signatures route should work."""
        # Get user id from token
        from dependencies import decode_access_token
        token = auth_headers["Authorization"].replace("Bearer ", "")
        payload = decode_access_token(token)
        user_id = payload["sub"]

        response = client.get(f"/users/{user_id}/signatures", headers=auth_headers)
        assert response.status_code == 200
        assert "signatures" in response.json()


class TestRegressionBugs:
    """Regression tests for verified bugs."""

    def test_invalid_feedback_type_returns_400(self, client):
        """Invalid feedback type should return 400 Bad Request, not 500."""
        response = client.post(
            "/feedback",
            data={"feedback_type": "invalid_type_xyz", "message": "hello"},
        )
        assert response.status_code == 400
        assert "Invalid feedback type" in response.json()["detail"]

    def test_invalid_base64_verify_returns_400(self, client):
        """Invalid base64 signature/key should return 400, not 500."""
        response = client.post(
            "/verify",
            data={"public_key": "not-valid-base64!?", "signature": "not-valid-base64!?"},
            files={"file": ("test.txt", b"hello world")},
        )
        assert response.status_code == 400
        assert "Invalid signature or public key format" in response.json()["error"]

    def test_discord_webhook_creation(self, client, auth_headers):
        """Discord webhooks should be accepted by schema validation."""
        response = client.post(
            "/webhooks",
            json={
                "name": "Discord Alert",
                "url": "https://discord.com/api/webhooks/1234/token",
                "type": "discord",
                "events": ["signature.created"],
            },
            headers=auth_headers,
        )
        assert response.status_code == 200
        assert response.json()["type"] == "discord"
