# OriginMark Developer Guide & Technical Reference

This document serves as the comprehensive technical reference for the OriginMark ecosystem. It covers system architecture, cryptographic mechanisms, authentication flows, and the API surface.

---

## 1. System Overview

OriginMark is a digital provenance service designed to establish cryptographic proof of origin and integrity for content, particularly AI-generated media. The system consists of three primary layers:

1. **Core API (FastAPI):** A high-performance, async-first Python backend responsible for cryptographic operations, identity management, and persistent storage.
2. **Web Infrastructure:** A modern Next.js 16 web dashboard (React 19, Tailwind CSS v4, Turbopack) for end-user signing, verification, and inspection.

---

## 2. Cryptographic Core

OriginMark relies on the **Ed25519** public-key signature system (via `libsodium`/`PyNaCl`) due to its speed, high security margin, and immunity to side-channel attacks.

### Signing Workflow
1. **Hashing:** The raw binary content of a target file is hashed using **SHA-256**.
2. **Signing:** The resulting SHA-256 hash is signed using an Ed25519 private key.
3. **Storage:** The system generates a JSON "sidecar" containing the signature, the corresponding public key, a timestamp, and custom metadata (e.g., author, AI model used).
4. **Distribution:** The original file and the sidecar `.originmark.json` file travel together.

### Verification Workflow
1. The client provides the target file, the signature, and the public key.
2. The system re-hashes the provided file using SHA-256.
3. The system verifies the provided signature against the re-computed hash using the provided Ed25519 public key.
4. If verification succeeds, it mathematically proves that the file has not been altered since it was signed by the owner of the private key.

---

## 3. Authentication & Authorization

The API supports dual-mode authentication, securely separating user sessions from programmatic access.

### JWT Bearer Authentication (User Sessions)
- **Usage:** Dashboard web app, user account management.
- **Flow:** Clients authenticate via `/auth/login` using username/password. The server returns a JWT signed with `HS256`.
- **Security:** Passwords are hashed via `bcrypt` with a computational work factor. JWTs are stateless and expire based on the `JWT_EXPIRATION_HOURS` environment variable.

### API Key Authentication (Programmatic Access)
- **Usage:** CLI, automated scripts, server-to-server integrations.
- **Format:** Keys are prefixed with `om_` for easy identification.
- **Storage:** The system never stores raw API keys. Keys are hashed (SHA-256) before database insertion. If a user loses their key, they must generate a new one.
- **Validation:** The API detects the `om_` prefix in the `Authorization: Bearer` header, hashes the incoming string, and performs a constant-time comparison against the database.

---

## 4. Database Architecture & Migrations

OriginMark uses **SQLAlchemy** for ORM and **Alembic** for schema migrations. The default database in development is PostgreSQL (configured via Docker Compose) or SQLite for lightweight testing.

### Core Tables
- `users`: Identity management (UUIDs, usernames, bcrypt hashes, `is_admin` flag).
- `api_keys`: Hashed programmatic access tokens linked to users.
- `signatures`: Metadata storage for signed content (content hash, author, timestamp). **Note:** Private keys are never stored in the database.
- `webhooks`: Registered notification endpoints (`slack`, `discord`) and subscribed event filters.
- `user_feedback`: User feedback entries and telemetry tracking.

### Managing Schema Changes
The project enforces strict version control over the database schema. Direct `Base.metadata.create_all()` calls are prohibited.

```bash
# Generate a new migration after editing models
alembic revision --autogenerate -m "description of change"

# Apply pending migrations to the database
alembic upgrade head
```

---

## 5. API Surface Specification

All endpoints are hosted under `http://{HOST}:8000`. 

### Auth Router (`/auth`)
*   `POST /auth/register`: Accepts `username`, `email`, `password`. Creates a new user.
*   `POST /auth/login`: Accepts `username`, `password`. Returns `{ "access_token": "...", "token_type": "bearer" }`.
*   `POST /auth/api-keys`: (Requires JWT) Creates a new programmatic `om_` API key.
*   `GET /auth/api-keys`: (Requires JWT) Lists metadata for active keys.
*   `DELETE /auth/api-keys/{id}`: (Requires JWT) Revokes an API key.

### Signatures Router
*   `POST /sign`: 
    *   **Payload:** `multipart/form-data` containing the `file`.
    *   **Form Data:** `author`, `model_used`, `private_key` (optional, auto-generated if omitted), `format` (optional, `"c2pa"` for C2PA manifest).
    *   **Returns:** Signature sidecar data.
*   `POST /verify`: 
    *   **Payload:** `multipart/form-data` containing the `file`.
    *   **Form Data:** `signature`, `public_key` OR `signature_id`.
    *   **Returns:** `{ "valid": true/false, "message": "...", "content_hash": "...", "metadata": ... }`.
*   `GET /me/signatures`: (Requires JWT or API Key) Returns a list of all signatures generated by the authenticated identity.
*   `GET /users/{user_id}/signatures`: (Requires JWT or API Key; owner or admin only) Returns signatures belonging to the specified user.
*   `GET /signatures/{id}`: Retrieves public metadata for a specific signature ID.
*   `GET /signatures/{id}/c2pa`: Exports the signature as a C2PA v1.4 schema-aligned JSON manifest.
*   `GET /badge?id={id}`: Generates an SVG/HTML verification badge for frontend display.

### Webhooks Router (`/webhooks`)
*   `POST /webhooks`: (Requires JWT or API Key) Register a new webhook endpoint. Supports Slack and Discord (`type: "slack" | "discord"`, `events: ["signature.created"]`).
*   `GET /webhooks`: (Requires JWT or API Key) List all registered webhooks for the authenticated user.
*   `DELETE /webhooks/{webhook_id}`: (Requires JWT or API Key) Delete a registered webhook.

### Admin & Feedback Router
*   `POST /feedback`: Submit user feedback or bug report.
*   `GET /admin/metrics`: (Requires Admin) Aggregated usage telemetry and system health.
*   `GET /admin/feedback`: (Requires Admin) List submitted feedback.
*   `PATCH /admin/feedback/{feedback_id}`: (Requires Admin) Update feedback resolution status.



## 6. Development & Testing Workflow

### Local Setup
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

### Test Infrastructure
The API relies on `pytest` and `pytest-asyncio`. 
*   **Isolation:** Tests utilize an in-memory SQLite database (`sqlite://`) injected via dependency overrides. Every test function receives a completely clean, isolated database state. No disk I/O is required.
*   **Execution:** 
    ```bash
    python -m pytest tests/ -v
    ```

### Code Standards
- All dependencies injected via FastAPI `Depends()`.
- Circular imports mitigated by centralizing logic in `dependencies.py`.
- No raw cryptographic operations in routers; defer to `nacl` bindings and `dependencies.py` utility functions.

---

## 7. Dependency Selection, Acquisition & Tracking Policy

OriginMark enforces rigorous dependency governance to minimize supply-chain risk:

### Selection Criteria
* **Minimal Footprint**: Avoid introducing packages for tasks solvable with standard library modules.
* **Cryptographic Rigor**: Core cryptography is restricted strictly to audited, industry-standard libraries (`PyNaCl`/`libsodium`).
* **Active Maintenance & Security Track Record**: Dependencies must show active maintenance, responsive security patching, and comprehensive test suites.
* **License Compatibility**: All dependencies must be licensed under OSI-approved permissive licenses (MIT, Apache 2.0, BSD).

### Acquisition & Pinning
* **Python**: Ingested strictly from official PyPI repositories via `pip` and declared with pinned versions in `api/requirements.txt` and PEP 621 metadata in `api/pyproject.toml`.
* **Frontend**: Ingested strictly from the official npmjs registry via `npm ci` using the committed `web/package-lock.json` lockfile.

### Continuous Tracking & Auditing
* **Automated CI Scans**: Every push and pull request triggers automated dependency vulnerability audits using `pip-audit` (PyPA advisory database) and `npm audit --audit-level=high`.
* **Dependency Monitoring**: Critical advisories trigger immediate triage and patch release within the SLAs defined in [SECURITY.md](../SECURITY.md).
