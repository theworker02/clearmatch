# Security Policy

This repository is a portfolio-grade demo, not a hosted production service.

## Reporting

For demo review, open an issue with:

- Affected route or screen.
- Steps to reproduce.
- Expected behavior.
- Actual behavior.

## Production checklist

- Use a managed MongoDB deployment with restricted network access.
- Store JWT secrets in a secret manager.
- Use HTTPS and secure cookies for browser sessions.
- Add request rate limits and abuse detection.
- Run malware and content safety checks on uploads.
- Store media in private object storage with signed URLs.
- Add role-based admin permissions.
- Add audit logs for moderation actions.
