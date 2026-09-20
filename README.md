# OriginMark

Cryptographic signing and verification for AI-generated content. Uses Ed25519 signatures.

## What it does

OriginMark lets you prove that content (text, images, etc.) came from a specific source and hasn't been tampered with. Think of it like a digital wax seal for AI outputs.

**The problem:** Anyone can claim AI wrote something, or that they wrote something AI actually made. There's no easy way to prove either.

**The solution:** Sign content with a cryptographic key. Verify signatures anywhere, anytime.

## Quick Start

```bash
# Clone and set up
git clone https://github.com/krikera/originmark-platform
cd originmark

# Run the API
cd api && pip install -r requirements.txt
uvicorn main:app --reload
```

## Components

```
originmark/
├── api/          # FastAPI backend (Ed25519 signing, SQLAlchemy, JWT/API keys, Webhooks, C2PA)
└── web/          # Next.js 16 dashboard (React 19, Tailwind CSS v4, Turbopack)
```

### Web Dashboard

```bash
cd web && npm install && npm run dev
# Open http://localhost:3000
```



## How it works

1. Content gets hashed (SHA-256)
2. Hash gets signed with Ed25519 private key
3. Signature + public key + metadata saved as `.originmark.json` sidecar
4. Anyone can verify using just the sidecar file

### Sidecar format

```json
{
  "id": "abc123",
  "content_hash": "sha256...",
  "signature": "base64...",
  "public_key": "base64...",
  "timestamp": "2025-01-15T10:30:00Z",
  "metadata": {
    "author": "John",
    "model_used": "GPT-4"
  }
}
```

## Security

- Private keys are never stored on our servers (generated ephemerally or passed by you)
- Ed25519 signatures (same as Signal, SSH)
- Open source, audit the code yourself

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login and get JWT token |
| POST | `/sign` | Sign content (Ed25519 or C2PA format) |
| POST | `/verify` | Verify content and signature |
| GET | `/badge?id=X` | Get badge HTML |
| GET | `/signatures/{id}` | Get signature details |
| GET | `/signatures/{id}/c2pa` | Export signature as C2PA manifest |
| GET | `/me/signatures` | Get authenticated user's signatures |
| GET | `/users/{user_id}/signatures` | Get signatures for a user (owner or admin) |
| POST | `/webhooks` | Register Slack or Discord webhook |
| GET | `/webhooks` | List user's registered webhooks |
| DELETE | `/webhooks/{id}` | Remove a registered webhook |

## Testing

```bash
# API test
curl -X POST "http://localhost:8000/sign" \
  -F "file=@test.txt" \
  -F "author=Test" \
  -F "model_used=GPT-4"
```

## Contributing

PRs welcome. Fork, branch, commit, push, open PR.

## License

MIT