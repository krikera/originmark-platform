# Security Policy

OriginMark takes the security and integrity of cryptographic provenance and signing infrastructure seriously. This document outlines our supported versions, reporting procedures, and security commitments.

---

## Supported Versions

Only the latest active release branch receives security updates and bug fixes:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability in OriginMark, **please do NOT disclose it publicly via a public GitHub issue**.

### Preferred Reporting Channels

1. **GitHub Private Vulnerability Reporting**:
   Navigate to the [Security Advisories](https://github.com/krikera/originmark-platform/security/advisories) tab and click **"Report a vulnerability"**. This creates a confidential channel between you and the project maintainers.
2. **Direct Security Email**:
   If you cannot use GitHub's private reporting, email details to **[security@originmark.dev](mailto:security@originmark.dev)**. Please include:
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

## Known Limitations

* **No Key Recovery by Design**: Because private keys are never persisted server-side, lost private keys cannot be recovered by the platform.