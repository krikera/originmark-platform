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
