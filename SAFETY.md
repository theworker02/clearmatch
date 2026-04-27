# Safety Notes

Safety controls included in the demo:

- 18+ age gate in profile setup and backend validation.
- Photo upload MIME validation for JPEG, PNG, and WEBP.
- Block user action.
- Report user action.
- Hide profile action.
- Pause account action.
- Screenshot warning setting and preview.
- Basic moderation queue for reports.
- Messaging only after mutual match.

Production hardening should add image moderation, rate limits, device/session management, stronger admin roles, audit logs, secure object storage, CSRF protections where applicable, and background moderation workflows.
