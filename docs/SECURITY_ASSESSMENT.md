# OriginMark Security & Threat Assessment

This document provides a structured security assessment and threat model for the OriginMark platform, fulfilling OpenSSF Best Practices [OSPS-SA-03.01]. It analyzes key assets, threat actors, potential attack vectors, likelihood, impact, and architectural mitigations implemented.

---

## 1. Scope & Primary Assets

| Asset | Description | Security Objective |
| :--- | :--- | :--- |
| **Signing Keys** | Ed25519 private keys used to generate cryptographic content signatures. | Strict confidentiality; zero server-side persistence. |
| **Signature Metadata** | Stored public keys, SHA-256 hashes, timestamps, and C2PA manifests. | Integrity and authenticity; prevention of unauthorized tampering. |
| **API Keys & Credentials** | User password hashes and programmatic `om_` API tokens. | Confidentiality, constant-time validation, strong one-way hashing. |
| **Web Service Infrastructure** | FastAPI backend and Next.js frontend web applications. | High availability, input validation, defense against DoS and injection. |

---

## 2. Threat Modeling & Risk Analysis

The following threat matrix assesses potential risks using an adapted STRIDE/CVSS evaluation model:

### Threat 1: Private Key Exfiltration / Leakage
* **Threat Description**: An attacker compromises the API server or database to harvest users' private signing keys.
* **Likelihood**: **Low**
* **Impact**: **Critical**
* **Mitigation Implemented**:
  * **Zero Server-Side Key Custody**: OriginMark does not persist private keys in the database. 
  * Ephemeral keys generated for one-off signing are held exclusively in volatile memory for the duration of the signing operation and discarded immediately.
  * Clients holding persistent private keys sign payloads client-side or pass keys ephemerally over TLS 1.2+ encrypted channels.

### Threat 2: Signature Forgery & Replay Attacks
* **Threat Description**: An adversary attempts to forge an Ed25519 signature or reuse a valid signature on altered content.
* **Likelihood**: **Very Low**
* **Impact**: **High**
* **Mitigation Implemented**:
  * **Ed25519 (RFC 8032)**: Uses standard Curve25519 with 128-bit cryptographic security margin, implemented via audited libsodium (`PyNaCl`) bindings.
  * **Full Content Hashing**: Content is digested with SHA-256 before signing. Any alteration of 1 bit changes the digest, failing verification immediately.
  * **Independent Verification**: Anyone can independently verify signatures mathematically without contacting the server.

### Threat 3: Timing Attacks on Authentication Credentials
* **Threat Description**: An attacker uses statistical timing measurements of string comparisons to deduce valid `om_` API keys.
* **Likelihood**: **Medium**
* **Impact**: **High**
* **Mitigation Implemented**:
  * API keys are hashed with SHA-256 before database lookup.
  * Key comparisons utilize constant-time comparison algorithms (`secrets.compare_digest`), eliminating timing side-channels.

### Threat 4: Dependency & Supply Chain Vulnerabilities
* **Threat Description**: Compromise of a third-party Python package or npm module used in the platform.
* **Likelihood**: **Medium**
* **Impact**: **High**
* **Mitigation Implemented**:
  * Standard lockfiles (`package-lock.json`, pinned `requirements.txt`).
  * Continuous automated vulnerability scanning in GitHub Actions CI using `pip-audit` (PyPI advisory database) and `npm audit`.
  * SAST security analysis via `bandit` and `ruff`.

### Threat 5: Denial of Service (DoS) via Large File Signing
* **Threat Description**: An adversary uploads massive files to exhaust server memory or CPU resources.
* **Likelihood**: **Medium**
* **Impact**: **Medium**
* **Mitigation Implemented**:
  * Rate limiting enforced via `slowapi` on signing endpoints.
  * Streaming chunked hashing for binary uploads rather than buffering entire large files into memory.

---

## 3. Residual Risk & Ongoing Governance

* **Loss of Private Keys**: Because the platform does not hold private keys, users who lose their client-side private keys cannot recover them. This limitation is explicitly documented to users.
* **Review Cadence**: This security assessment is reviewed and updated upon every minor or major version release or whenever cryptographic architectures are modified.
