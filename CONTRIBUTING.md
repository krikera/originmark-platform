# Contributing to OriginMark

Thank you for your interest in contributing to OriginMark! We welcome contributions from everyone, whether you are fixing a bug, improving documentation, adding new features, or reporting issues.

This document outlines the guidelines and conventions for contributing to the repository.

---

## Code of Conduct

By participating in this project, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to [security@originmark.dev](mailto:security@originmark.dev).

---

## Getting Started

### Prerequisites

* **Python**: Version 3.11+
* **Node.js**: Version 20.0.0+ (and `npm`)
* **Git**: Distributed version control

### Local Development Setup

#### 1. Fork & Clone the Repository
```bash
git clone https://github.com/krikera/originmark-platform.git
cd originmark-platform
git checkout -b feature/my-new-feature
```

#### 2. Backend Setup (FastAPI)
```bash
cd api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
The API documentation will be available at `http://localhost:8000/docs`.

#### 3. Frontend Setup (Next.js)
```bash
cd ../web
npm install
npm run dev
```
The web dashboard will be available at `http://localhost:3000`.

---

## Development Workflow & Standards

### Branching Strategy
* Create feature branches branched from `main`:
  * `feature/<feature-name>` for new functionality
  * `fix/<bug-description>` for bug fixes
  * `docs/<topic>` for documentation improvements

### Commit Messages
We encourage the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification:
* `feat: add C2PA manifest signer integration`
* `fix: handle invalid Ed25519 public key format`
* `docs: update API reference in DEVELOPER_GUIDE.md`
* `test: add unit tests for webhook signature generation`
* `chore: update dependencies`

---

## Testing Policy (Mandatory)

OriginMark adheres strictly to the OpenSSF Best Practices testing policy:
1. **Tests with Changes**: As major new functionality or bug fixes are added, corresponding automated tests **MUST** be added or updated.
2. **Regression Prevention**: Any bug report fixed in a pull request must be accompanied by a regression test verifying the fix.
3. **Passing Tests**: Pull requests will not be merged if any automated test in CI fails.

### Running Backend Tests
From the `api/` directory:
```bash
pytest
```
To run tests with coverage:
```bash
pytest --cov=. --cov-report=term-missing
```

### Running Frontend Checks
From the `web/` directory:
```bash
npm run typecheck    # Validate TypeScript types
npm run lint         # Check ESLint rules
npm test             # Run complete verification suite
```

---

## Submitting Pull Requests

1. **Verify Quality Locally**: Ensure all tests pass, linters report zero errors, and TypeScript compiles without errors.
2. **Keep Commits Clean**: Rebase your branch on `main` before opening a pull request.
3. **Fill the PR Template**: Describe the changes, motivations, linked issue(s), and testing conducted.
4. **Code Review**: At least one maintainer review is required before merging. Address any feedback thoughtfully.

---

## Reporting Bugs & Suggesting Features

* **Bug Reports**: Please open a report using our [Bug Report Form](https://github.com/krikera/originmark-platform/issues/new?template=bug_report.yml).
* **Feature Suggestions**: Propose new ideas via the [Feature Request Form](https://github.com/krikera/originmark-platform/issues/new?template=feature_request.yml).
* **Security Vulnerabilities**: Do **not** open a public issue for sensitive vulnerabilities. Follow the guidelines in our [Security Policy](SECURITY.md).
