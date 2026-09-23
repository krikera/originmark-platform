"""
Tests for the core sign/verify flow — the most critical path in OriginMark.

Covers:
    - Signing text files
    - Signing image files
    - Signing with a provided private key
    - Verifying valid signatures
    - Verifying tampered content (should fail)
    - Verifying with wrong public key (should fail)
    - Signature lookup by ID
    - Verification badge generation
    - Rejecting requests with no file
"""

import base64
import hashlib

import nacl.signing


class TestSignContent:
    """Tests for POST /sign"""

    def test_sign_text_file(self, client, sample_text_content):
        """Sign a text file and get a valid signature response."""
        response = client.post(
            "/sign",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
            data={"author": "Alice", "model_used": "GPT-4"},
        )
        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "id" in data
        assert "content_hash" in data
        assert "signature" in data
        assert "public_key" in data
        assert "timestamp" in data
        assert "metadata" in data

        # Verify content hash is correct SHA256
        expected_hash = hashlib.sha256(sample_text_content).hexdigest()
        assert data["content_hash"] == expected_hash

        # Verify metadata
        assert data["metadata"]["author"] == "Alice"
        assert data["metadata"]["model_used"] == "GPT-4"
        assert data["metadata"]["content_type"] == "text"

    def test_sign_image_file(self, client):
        """Sign an image file — content_type should be 'image'."""
        fake_png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 100
        response = client.post(
            "/sign",
            files={"file": ("photo.png", fake_png, "image/png")},
            data={"author": "Bob"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["metadata"]["content_type"] == "image"
        assert data["metadata"]["file_name"] == "photo.png"

    def test_sign_with_provided_private_key(self, client, sample_text_content):
        """Sign with a user-provided private key — should use that key."""
        # Generate a keypair
        signing_key = nacl.signing.SigningKey.generate()
        private_key_b64 = base64.b64encode(bytes(signing_key)).decode()
        expected_public_key = base64.b64encode(
            bytes(signing_key.verify_key)
        ).decode()

        response = client.post(
            "/sign",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
            data={"private_key": private_key_b64},
        )
        assert response.status_code == 200
        data = response.json()

        # Should use the provided key, not generate a new one
        assert data["public_key"] == expected_public_key

    def test_sign_no_file_returns_400(self, client):
        """Signing without a file should return 400."""
        response = client.post("/sign", data={"author": "Alice"})
        assert response.status_code == 400

    def test_sign_no_private_key_not_in_response(self, client, sample_text_content):
        """Private key must NEVER appear in the response."""
        response = client.post(
            "/sign",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
        )
        assert response.status_code == 200
        data = response.json()
        assert "private_key" not in data
        assert "private_key" not in data.get("metadata", {})

    def test_sign_stores_in_database(self, client, sample_text_content):
        """Signed content should be retrievable by ID."""
        sign_response = client.post(
            "/sign",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
            data={"author": "Alice"},
        )
        sig_id = sign_response.json()["id"]

        # Retrieve it
        get_response = client.get(f"/signatures/{sig_id}")
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["id"] == sig_id
        assert data["content_hash"] == sign_response.json()["content_hash"]

    def test_sign_different_content_different_hash(self, client):
        """Different content should produce different hashes."""
        r1 = client.post(
            "/sign",
            files={"file": ("a.txt", b"Content A", "text/plain")},
        )
        r2 = client.post(
            "/sign",
            files={"file": ("b.txt", b"Content B", "text/plain")},
        )
        assert r1.json()["content_hash"] != r2.json()["content_hash"]


class TestVerifyContent:
    """Tests for POST /verify"""

    def test_verify_valid_signature(self, client, sample_text_content, signed_content):
        """Verify a valid signature — should return valid=True."""
        response = client.post(
            "/verify",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
            data={
                "signature": signed_content["signature"],
                "public_key": signed_content["public_key"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert data["message"] == "Signature verified successfully"

    def test_verify_by_signature_id(self, client, sample_text_content, signed_content):
        """Verify using just the signature ID — fetches sig from DB."""
        response = client.post(
            "/verify",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
            data={"signature_id": signed_content["id"]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True

    def test_verify_tampered_content_fails(self, client, signed_content):
        """Tampered content should fail verification."""
        tampered = b"This content has been tampered with!"
        response = client.post(
            "/verify",
            files={"file": ("test.txt", tampered, "text/plain")},
            data={
                "signature": signed_content["signature"],
                "public_key": signed_content["public_key"],
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    def test_verify_tampered_content_by_id_fails(self, client, signed_content):
        """Tampered content verified by signature ID should fail with hash mismatch."""
        tampered = b"Tampered content"
        response = client.post(
            "/verify",
            files={"file": ("test.txt", tampered, "text/plain")},
            data={"signature_id": signed_content["id"]},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "hash mismatch" in data["message"].lower() or "mismatch" in data["message"].lower()

    def test_verify_wrong_public_key_fails(self, client, sample_text_content, signed_content):
        """Verification with wrong public key should fail."""
        # Generate a different keypair
        wrong_key = nacl.signing.SigningKey.generate().verify_key
        wrong_key_b64 = base64.b64encode(bytes(wrong_key)).decode()

        response = client.post(
            "/verify",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
            data={
                "signature": signed_content["signature"],
                "public_key": wrong_key_b64,
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    def test_verify_nonexistent_signature_id(self, client, sample_text_content):
        """Verifying a non-existent signature ID should fail."""
        response = client.post(
            "/verify",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
            data={"signature_id": "nonexistent-id-12345"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False

    def test_verify_no_file_returns_400(self, client, signed_content):
        """Verify without a file should return 400."""
        response = client.post(
            "/verify",
            data={
                "signature": signed_content["signature"],
                "public_key": signed_content["public_key"],
            },
        )
        assert response.status_code == 400

    def test_verify_missing_signature_and_key_returns_400(self, client, sample_text_content):
        """Verify without signature or public key should return 400."""
        response = client.post(
            "/verify",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
        )
        assert response.status_code == 400


class TestSignatureEndpoints:
    """Tests for GET /signatures/* and /badge"""

    def test_get_signature_by_id(self, client, signed_content):
        """Retrieve signature metadata by ID."""
        response = client.get(f"/signatures/{signed_content['id']}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == signed_content["id"]
        assert data["signature"] == signed_content["signature"]
        assert data["public_key"] == signed_content["public_key"]

    def test_get_nonexistent_signature_returns_404(self, client):
        """Non-existent signature ID should return 404."""
        response = client.get("/signatures/nonexistent-id")
        assert response.status_code == 404

    def test_badge_returns_html(self, client, signed_content):
        """Badge endpoint should return valid HTML."""
        response = client.get(f"/badge?id={signed_content['id']}")
        assert response.status_code == 200
        assert "text/html" in response.headers["content-type"]
        assert "Verified AI Content" in response.text
        assert signed_content["content_hash"] in response.text

    def test_badge_nonexistent_id_returns_404(self, client):
        """Badge for non-existent ID should return 404."""
        response = client.get("/badge?id=nonexistent")
        assert response.status_code == 404


class TestSignVerifyRoundtrip:
    """End-to-end sign → verify roundtrip tests."""

    def test_full_roundtrip_text(self, client):
        """Sign text, then verify — full E2E flow."""
        content = b"AI-generated blog post about quantum computing."

        # Sign
        sign_resp = client.post(
            "/sign",
            files={"file": ("post.txt", content, "text/plain")},
            data={"author": "AI Writer", "model_used": "Claude"},
        )
        assert sign_resp.status_code == 200
        sig_data = sign_resp.json()

        # Verify with explicit sig + key
        verify_resp = client.post(
            "/verify",
            files={"file": ("post.txt", content, "text/plain")},
            data={
                "signature": sig_data["signature"],
                "public_key": sig_data["public_key"],
            },
        )
        assert verify_resp.status_code == 200
        assert verify_resp.json()["valid"] is True

        # Verify by signature ID
        verify_id_resp = client.post(
            "/verify",
            files={"file": ("post.txt", content, "text/plain")},
            data={"signature_id": sig_data["id"]},
        )
        assert verify_id_resp.status_code == 200
        assert verify_id_resp.json()["valid"] is True

    def test_roundtrip_with_user_key(self, client):
        """Sign with user's own key, verify with the matching public key."""
        signing_key = nacl.signing.SigningKey.generate()
        priv_b64 = base64.b64encode(bytes(signing_key)).decode()
        pub_b64 = base64.b64encode(bytes(signing_key.verify_key)).decode()

        content = b"Signed with my own key."

        # Sign with provided key
        sign_resp = client.post(
            "/sign",
            files={"file": ("doc.txt", content, "text/plain")},
            data={"private_key": priv_b64},
        )
        assert sign_resp.status_code == 200
        sig_data = sign_resp.json()
        assert sig_data["public_key"] == pub_b64

        # Verify
        verify_resp = client.post(
            "/verify",
            files={"file": ("doc.txt", content, "text/plain")},
            data={"signature": sig_data["signature"], "public_key": pub_b64},
        )
        assert verify_resp.status_code == 200
        assert verify_resp.json()["valid"] is True


class TestSignBoundaries:
    """Boundary condition tests for signing."""

    def test_sign_invalid_private_key_returns_400(self, client, sample_text_content):
        """Invalid base64 private key should return 400 Bad Request."""
        response = client.post(
            "/sign",
            files={"file": ("test.txt", sample_text_content, "text/plain")},
            data={"private_key": "not-valid-base64!?"},
        )
        assert response.status_code == 400
        assert "Invalid private key format" in response.json()["error"]

    def test_sign_file_too_large_returns_413(self, client):
        """File larger than 25MB should return 413 Payload Too Large."""
        import io
        large_data = b"x" * (25 * 1024 * 1024 + 10)
        response = client.post(
            "/sign",
            files={"file": ("large.bin", io.BytesIO(large_data), "application/octet-stream")},
        )
        assert response.status_code == 413
        assert "File too large" in response.json()["detail"]


class TestC2PAIntegration:
    """Tests for C2PA manifest creation and export endpoints."""

    def test_sign_with_c2pa_format(self, client, sample_text_content):
        """Signing with format=c2pa returns C2PA manifest in response."""
        response = client.post(
            "/sign",
            files={"file": ("artwork.png", sample_text_content, "image/png")},
            data={"author": "Leonardo", "model_used": "DALL-E 3", "format": "c2pa"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["format"] == "c2pa"
        assert "manifest" in data
        assert "validation" in data
        assert data["validation"]["valid"] is True

        manifest = data["manifest"]
        assert manifest["claim_generator"] == "OriginMark/0.1.0"
        assert len(manifest["claim"]["assertions"]) >= 3
        # Check required assertions
        labels = [a["label"] for a in manifest["claim"]["assertions"]]
        assert "c2pa.actions" in labels
        assert "c2pa.hash.data" in labels
        assert "org.originmark.signature" in labels

    def test_export_existing_signature_as_c2pa(self, client, signed_content):
        """Export an existing signature as C2PA JSON manifest via GET /signatures/{id}/c2pa."""
        sig_id = signed_content["id"]
        response = client.get(f"/signatures/{sig_id}/c2pa")
        assert response.status_code == 200
        data = response.json()
        assert data["format"] == "c2pa"
        assert data["signature_id"] == sig_id
        assert data["validation"]["valid"] is True
        assert data["manifest"]["originmark_metadata"]["signature_id"] == sig_id

    def test_export_nonexistent_signature_c2pa_returns_404(self, client):
        """C2PA export for nonexistent signature returns 404."""
        response = client.get("/signatures/nonexistent-uuid-c2pa/c2pa")
        assert response.status_code == 404

