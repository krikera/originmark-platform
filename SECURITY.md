# Security

## Reporting Issues

Found a security problem? Please [open a GitHub issue](https://github.com/krikera/originmark-platform/issues/new) with details, or submit a pull request with a fix. For sensitive security issues, you can use GitHub's private vulnerability reporting feature.

## How we handle keys

- You can generate your own private keys client-side and pass them in, or let the API generate them ephemerally.
- If the API generates a key for you, it is used instantly and discarded. We never store your private keys.
- Keys stay on your device unless you explicitly provide them to the API payload.

## Crypto

- **Signatures**: Ed25519 (same as SSH, Signal)
- **Hashing**: SHA-256
- **TLS**: 1.2+ required

## Infrastructure

- All API traffic encrypted
- Rate limiting on all endpoints
- Input validation with Pydantic

## Known Limitations

- No key recovery (by design - you own it)

## Contributing

Found something to improve? [Open a pull request](https://github.com/krikera/originmark-platform/pulls) or [create an issue](https://github.com/krikera/originmark-platform/issues/new).