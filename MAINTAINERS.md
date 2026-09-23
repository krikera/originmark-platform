# Project Maintainers & Governance

This document lists the maintainers of OriginMark, their roles and responsibilities, access to sensitive project resources, and collaborator escalation policies in accordance with OpenSSF Best Practices.

---

## Maintainers List & Resource Access

| Member | GitHub Handle | Role | Access to Sensitive Resources |
| :--- | :--- | :--- | :--- |
| **Krishna Ketan Rai** | [@krikera](https://github.com/krikera) | Lead Maintainer & Author | Full Administrative Access: GitHub repository settings, branch protection rules, CI/CD secrets and tokens, production deployment environments (Vercel), and GitHub Security Advisories. |

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

## Collaborator Review & Permission Escalation Policy

To maintain repository security and supply-chain integrity ([OSPS-GV-04.01]):
1. **Prerequisites for Escalation**: Contributors seeking triage, review, or committer privileges must demonstrate a sustained history of verified, high-quality contributions, familiarity with our security practices, and compliance with the Code of Conduct.
2. **Review & Vetting**: The Lead Maintainer conducts a formal review of the candidate’s commit history, past code reviews, and community interactions. Identity lineage is established via cryptographically signed commits (GPG/SSH) and verified GitHub profile associations.
3. **Approval & Onboarding**: Escalation requires explicit Lead Maintainer approval. Newly appointed collaborators must enable multi-factor authentication (2FA) and complete an onboarding review of release security and secret handling procedures.
4. **Least-Privilege Role Assignment**: Escalated privileges are granted strictly at the lowest required tier (e.g., Triage or Write) and are audited semiannually.

---

## Escalation & Contact

For private security matters, follow the disclosure procedure in [SECURITY.md](SECURITY.md). For general governance and administrative inquiries, reach out to maintainers via [GitHub Discussions](https://github.com/krikera/originmark-platform/discussions) or directly at [@krikera](https://github.com/krikera).
