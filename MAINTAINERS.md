# Project Maintainers & Governance

This document lists the maintainers of OriginMark, their roles and responsibilities, and their access to sensitive project resources in accordance with OpenSSF Best Practices.

---

## Maintainers List & Resource Access

| Member | GitHub Handle | Role | Access to Sensitive Resources |
| :--- | :--- | :--- | :--- |
| **Krishna Rai** | [@krikera](https://github.com/krikera) | Lead Maintainer & Author | Full Administrative Access: GitHub repository settings, branch protection rules, CI/CD secrets and tokens, production deployment environments (Vercel), and GitHub Security Advisories. |

---

## Roles & Responsibilities

### Lead Maintainer
* **Repository Administration**: Oversees repository settings, branch protection rules, and access control.
* **Release Engineering**: Authorizes and signs official version releases, creates release tags, and publishes release notes.
* **Code Review & Quality Gate**: Reviews, approves, and merges pull requests, ensuring code quality, test coverage, and security policies are upheld.
* **Security & Vulnerability Response**: Manages confidential vulnerability reports via GitHub Private Vulnerability Reporting, triages reports within established SLAs, and prepares patches and coordinated public disclosures.
* **Dependency & Architecture Governance**: Evaluates new third-party dependencies, reviews architecture changes, and maintains compatibility with open standards (e.g., C2PA, Ed25519).

### Contributors & Community Members
* **Issue Reporting & Discussion**: Submits structured bug reports, feature requests, and participates in GitHub Discussions.
* **Code Contributions**: Submits clean pull requests adhering to CONTRIBUTING guidelines, Conventional Commits, and test coverage standards.
* **Peer Feedback**: Reviews community pull requests and tests bug fixes.

---

## Escalation & Contact

For private security matters, follow the disclosure procedure in [SECURITY.md](SECURITY.md). For general governance and administrative inquiries, reach out to maintainers via [GitHub Discussions](https://github.com/krikera/originmark-platform/discussions) or directly at [@krikera](https://github.com/krikera).
