# Security Policy

OriginMark takes the security and integrity of cryptographic provenance and signing infrastructure seriously. This document outlines our supported versions, reporting procedures, and security commitments.

---

## Supported Versions

Only the latest active release branch receives security updates and bug fixes:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

Versions `< 0.1.0` are End-of-Life (EOL) and no longer receive security updates.

---

## Reporting a Vulnerability

If you discover a security vulnerability in OriginMark, **please do NOT disclose it publicly via a public GitHub issue**.

### Preferred Reporting Channels

1. **GitHub Private Vulnerability Reporting (Recommended)**:
   Navigate to the [Security Advisories](https://github.com/krikera/originmark-platform/security/advisories) tab and click **"Report a vulnerability"**. This creates an encrypted, confidential disclosure channel between you and the project maintainers.
2. **Direct Maintainer Contact**:
   If you cannot access GitHub Private Vulnerability Reporting, contact the maintainers confidentially via [GitHub Security Advisories](https://github.com/krikera/originmark-platform/security/advisories/new) or reach out directly to the maintainer profile [@krikera](https://github.com/krikera). Please include:
   * A detailed description of the vulnerability.
   * Reproduction steps or a minimal proof-of-concept (PoC).
   * Potential impact and affected endpoints/components.

### Response Time & SLA Commitments

We adhere to the OpenSSF Best Practices vulnerability reporting requirements:
* **Initial Acknowledgement**: We will acknowledge receipt of your vulnerability report within **48 hours**.
* **Triage & Remediation Plan**: We will assess the severity and provide a remediation plan within **14 days** of receipt.
* **Public Disclosure**: Coordinated disclosure will occur once a patch is tested and released, typically within 30 to 60 days.

---

## Cryptographic Architecture & Key Management

* **Signatures**: Ed25519 (RFC 8032) implemented via `PyNaCl`/`libsodium`.
* **Content Hashing**: SHA-256 for all binary payload digest computations.
* **Key Custody**: Private keys are **never** stored in the OriginMark database. Keys may be passed ephemerally by the client or generated on-the-fly and immediately discarded after signing.
* **Password Storage**: User passwords are stored using salted `bcrypt` hashes with computational work factors.
* **API Keys**: Programmatic `om_` API keys are hashed with SHA-256 before database storage; raw keys are shown once upon creation and validated via constant-time comparisons.
* **Transport Encryption**: TLS 1.2+ required across all API endpoints.

---

## Secrets & Credentials Management Policy

* **Storage**: Secrets and credentials (CI tokens, deployment tokens) are strictly stored in GitHub Encrypted Secrets with environment protection rules. Zero credentials, API keys, or private keys are stored in source code.
* **Access Control**: Access to production secrets is restricted to the Lead Maintainer and requires multi-factor authentication (2FA).
* **Rotation**: Tokens are rotated on a 90-day cadence. Any credential suspected of compromise is revoked immediately.

---

## Software Composition Analysis (SCA) Policy

All dependencies are continuously evaluated in CI using `pip-audit` and `npm audit`.
* **Remediation Thresholds**:
  * **Critical & High Severity**: Remediation required within **7 days**. All releases are blocked until resolved.
  * **Medium Severity**: Remediation required within **30 days**.
  * **Low Severity**: Remediation scheduled in the next regular sprint/minor release.
* **Pre-Release Gate**: No official release may be published with unaddressed High or Critical SCA violations unless formally documented as non-exploitable in [docs/VEX.json](docs/VEX.json).

---

## Static Application Security Testing (SAST) Policy

All code changes are automatically scanned using `bandit`, `ruff`, and `eslint` in GitHub Actions.
* **Zero Critical/High Tolerance**: Pull requests introducing High or Medium security warnings are blocked automatically in CI.
* **Suppression Policy**: False positives must be documented with an explicit rationale in security configuration files or suppressed via audited VEX declarations.

---

## Known Limitations

* **No Key Recovery by Design**: Because private keys are never persisted server-side, lost private keys cannot be recovered by the platform.