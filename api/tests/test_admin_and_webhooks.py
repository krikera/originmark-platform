"""
Tests for Admin endpoints, user feedback, metrics telemetry, and Webhooks.
"""

import pytest
from db import User


@pytest.fixture()
def admin_user(db_session, client):
    """Create and return an admin user and access token."""
    response = client.post("/auth/register", json={
        "email": "admin@example.com",
        "username": "adminuser",
        "password": "adminpassword123",
    })
    assert response.status_code == 200
    user_id = response.json()["user_id"]

    # Mark user as admin in DB
    user = db_session.query(User).filter(User.id == user_id).first()
    user.is_admin = True
    db_session.commit()

    # Login to get token
    login_resp = client.post("/auth/login", json={
        "username": "adminuser",
        "password": "adminpassword123",
    })
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return {
        "user_id": user_id,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


class TestAdminMetrics:
    """Tests for GET /admin/metrics"""

    def test_admin_metrics_with_admin_user(self, client, admin_user):
        """Admin user can view system metrics dashboard."""
        response = client.get("/admin/metrics", headers=admin_user["headers"])
        assert response.status_code == 200
        data = response.json()
        assert "period" in data
        assert "totals" in data
        assert "action_breakdown" in data

    def test_admin_metrics_forbidden_for_non_admin(self, client, auth_headers):
        """Regular non-admin user should receive 403 Forbidden."""
        response = client.get("/admin/metrics", headers=auth_headers)
        assert response.status_code == 403
        assert "Admin privileges required" in response.json()["detail"]

    def test_admin_metrics_unauthenticated(self, client):
        """Unauthenticated request returns 401."""
        response = client.get("/admin/metrics")
        assert response.status_code in (401, 403)


class TestFeedbackWorkflow:
    """Tests for POST /feedback, GET /admin/feedback, PATCH /admin/feedback/{id}"""

    def test_submit_valid_feedback(self, client):
        """Anyone can submit valid feedback."""
        response = client.post(
            "/feedback",
            data={
                "feedback_type": "feature",
                "message": "Please add batch C2PA manifest download",
                "rating": 5,
                "page_url": "https://originmark.dev",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "submitted"
        assert "feedback_id" in data

    def test_submit_feedback_invalid_rating(self, client):
        """Rating outside 1-5 should return 400."""
        response = client.post(
            "/feedback",
            data={
                "feedback_type": "bug",
                "message": "Invalid rating test",
                "rating": 6,
            },
        )
        assert response.status_code == 400
        assert "between 1 and 5" in response.json()["detail"]

    def test_admin_view_and_patch_feedback(self, client, admin_user):
        """Admin can list feedback and update its status."""
        # Submit feedback
        submit_resp = client.post(
            "/feedback",
            data={
                "feedback_type": "bug",
                "message": "UI glitch in dark mode",
                "rating": 4,
            },
        )
        fb_id = submit_resp.json()["feedback_id"]

        # Admin lists feedback
        list_resp = client.get("/admin/feedback", headers=admin_user["headers"])
        assert list_resp.status_code == 200
        feedbacks = list_resp.json()["feedback"]
        assert any(f["id"] == fb_id for f in feedbacks)

        # Admin updates status to 'reviewed'
        patch_resp = client.patch(
            f"/admin/feedback/{fb_id}?status=reviewed",
            headers=admin_user["headers"],
        )
        assert patch_resp.status_code == 200
        assert patch_resp.json()["new_status"] == "reviewed"

    def test_patch_feedback_invalid_status_returns_400(self, client, admin_user):
        """Invalid status string should return 400."""
        response = client.patch(
            "/admin/feedback/any-id?status=invalid_status",
            headers=admin_user["headers"],
        )
        assert response.status_code == 400
        assert "Invalid status" in response.json()["detail"]

    def test_patch_nonexistent_feedback_returns_404(self, client, admin_user):
        """Updating status of nonexistent feedback returns 404."""
        response = client.patch(
            "/admin/feedback/nonexistent-id?status=resolved",
            headers=admin_user["headers"],
        )
        assert response.status_code == 404


class TestUserSignaturesPermissions:
    """Tests for GET /users/{user_id}/signatures access control."""

    def test_admin_can_view_any_user_signatures(self, client, admin_user, registered_user):
        """Admin is authorized to view any user's signature history."""
        target_user_id = registered_user["user_id"]
        response = client.get(f"/users/{target_user_id}/signatures", headers=admin_user["headers"])
        assert response.status_code == 200
        assert "signatures" in response.json()

    def test_non_admin_cannot_view_other_user_signatures(self, client, auth_headers):
        """Non-admin user receives 403 when querying another user's ID."""
        response = client.get("/users/some-other-user-uuid/signatures", headers=auth_headers)
        assert response.status_code == 403


class TestWebhooksLifecycle:
    """Tests for Webhooks CRUD and security."""

    def test_webhook_crud_flow(self, client, auth_headers):
        """Register, list, and delete a Slack webhook."""
        # Create
        create_resp = client.post(
            "/webhooks",
            json={
                "name": "Team Slack Channel",
                "url": "https://hooks.slack.com/services/T00/B00/XXXX",
                "type": "slack",
                "events": ["signature.created"],
            },
            headers=auth_headers,
        )
        assert create_resp.status_code == 200
        wh_id = create_resp.json()["webhook_id"]

        # List
        list_resp = client.get("/webhooks", headers=auth_headers)
        assert list_resp.status_code == 200
        hooks = list_resp.json()["webhooks"]
        assert any(h["id"] == wh_id for h in hooks)

        # Delete
        del_resp = client.delete(f"/webhooks/{wh_id}", headers=auth_headers)
        assert del_resp.status_code == 200

        # Verify deletion
        list_after = client.get("/webhooks", headers=auth_headers)
        assert not any(h["id"] == wh_id for h in list_after.json()["webhooks"])

    def test_delete_nonexistent_webhook_returns_404(self, client, auth_headers):
        """Deleting a nonexistent webhook returns 404."""
        response = client.delete("/webhooks/nonexistent-wh-id", headers=auth_headers)
        assert response.status_code == 404

    def test_reject_ssrf_webhook_url(self, client, auth_headers):
        """Private / loopback URLs must be rejected with 400 Bad Request."""
        for unsafe_url in [
            "http://127.0.0.1:8000/callback",
            "http://localhost/test",
            "http://10.0.0.1/internal",
            "http://192.168.1.50/hook",
            "http://169.254.169.254/latest/meta-data",
        ]:
            resp = client.post(
                "/webhooks",
                json={
                    "name": "Malicious Hook",
                    "url": unsafe_url,
                    "type": "slack",
                    "events": ["signature.created"],
                },
                headers=auth_headers,
            )
            assert resp.status_code == 400
            assert "Invalid or unsafe webhook URL" in resp.json()["detail"]
