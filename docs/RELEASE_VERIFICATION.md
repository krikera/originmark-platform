# Release Asset Verification Guide

This document outlines instructions for downstream consumers and verifiers to mathematically confirm the integrity, authenticity, and provenance of official OriginMark release assets, fulfilling OpenSSF Best Practices [OSPS-DO-03.01] and [OSPS-DO-03.02].

---

## 1. Verifying Asset Integrity via SHA-256 Checksums

Every official release includes a published `SHA256SUMS` file alongside release archives in [GitHub Releases](https://github.com/krikera/originmark-platform/releases).

### Verification Steps

1. Download the release archive and corresponding `SHA256SUMS` file:
   ```bash
   curl -LO https://github.com/krikera/originmark-platform/releases/download/v0.1.0/originmark-v0.1.0.tar.gz
   curl -LO https://github.com/krikera/originmark-platform/releases/download/v0.1.0/SHA256SUMS
   ```

2. Validate the cryptographic checksum:
   ```bash
   sha256sum --check --ignore-missing SHA256SUMS
   ```
   **Expected Output**:
   ```text
   originmark-v0.1.0.tar.gz: OK
   ```

---

## 2. Verifying Release Provenance & Signer Identity (Sigstore / GitHub Attestations)

OriginMark releases are cryptographically signed with SLSA build provenance attestations generated via Sigstore and GitHub Artifact Attestations (`.github/workflows/release.yml`).

### Expected Author & Workflow Identity
* **Author / Repository Owner**: `krikera` ([@krikera](https://github.com/krikera))
* **Authoritative Repository**: `https://github.com/krikera/originmark-platform`
* **Release Workflow**: `.github/workflows/release.yml`

### Verification Command

Using the official [GitHub CLI (`gh`)](https://cli.github.com/):

```bash
gh attestation verify originmark-v0.1.0.tar.gz --owner krikera
```

**Expected Verification Output**:
```text
Loaded digest sha256:... for originmark-v0.1.0.tar.gz
Loaded 1 attestation from GitHub API
✓ Verification succeeded!
Attestation certificate issuer: https://token.actions.githubusercontent.com
Attestation signature verified via Sigstore public good instance
```
