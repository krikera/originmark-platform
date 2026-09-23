# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- GitHub Actions CI workflow for backend tests (`pytest`) and frontend checks (`tsc`, `eslint`).
- Community health files: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/ISSUE_TEMPLATE`, and `.github/pull_request_template.md`.
- Automated testing policy and guidelines for contributors.
- Security vulnerability reporting SLA and supported versions table in `SECURITY.md`.

---

## [0.1.0] - 2026-09-23

### Added
- **Core Cryptographic Engine**:
  - Ed25519 digital signing and verification using `PyNaCl` and `libsodium`.
  - SHA-256 cryptographic hashing for binary content integrity.
  - JSON sidecar generation (`.originmark.json`) linking signatures, timestamps, and author/model metadata.
- **API Surface (FastAPI)**:
  - Dual-mode authentication supporting stateless JWT tokens and hashed programmatic `om_` API keys.
  - Endpoints for signing (`/sign`), verification (`/verify`), and signature retrieval (`/signatures/{id}`).
  - Verification badge generator endpoint (`/badge`).
- **C2PA Integration**:
  - Export signatures as standardized C2PA v1.4 claims and assertions (`/signatures/{id}/c2pa`).
- **Webhooks & Notifications**:
  - Outbound event notifications for Slack and Discord webhook integrations.
- **Web Dashboard (Next.js 16)**:
  - React 19 web dashboard built with Tailwind CSS v4 and Framer Motion animations.
  - Interactive file dropzone for signing and verification.
  - Responsive layout, dark/light themes, and sonner toasts.
- **Database Architecture**:
  - PostgreSQL and SQLite support via SQLAlchemy ORM and Alembic schema migrations.
  - User identity, signature metadata, and usage telemetry models.
- **Testing Suite**:
  - 63 automated tests in `api/tests` covering admin, webhooks, authentication, and cryptographic signing workflows.

### Security
- Passwords hashed using salted `bcrypt` with computational work factors.
- Constant-time hash comparisons for API keys to mitigate timing side-channel attacks.
- Ephemeral private key handling ensuring zero server-side private key persistence.
