# Security Policy

## Reporting a Vulnerability

Please report private security issues directly to the project owner instead of opening a public issue.

## Production Requirements

- Firestore and Storage writes must stay restricted to Firebase custom claim `admin == true`.
- Keep `.env.local` and any service account credentials out of Git.
- Review Firebase rules before each production deployment.
