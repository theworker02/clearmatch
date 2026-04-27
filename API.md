# API Routes

Base URL: `http://localhost:4100/api`

Authenticated routes require `Authorization: Bearer <token>`.

## Auth

- `POST /auth/signup`
  - Body: `{ "email": string, "password": string }`
  - Creates an account and returns `{ user, token }`.
- `POST /auth/login`
  - Body: `{ "email": string, "password": string }`
  - Returns `{ user, token }`.
- `GET /me`
  - Returns the current user and profile.

## Profile

- `PUT /profile`
  - Saves the age-gated dating profile.
- `POST /photos`
  - Multipart upload. Accepts JPEG, PNG, WEBP under 4 MB.

## Discovery and Matching

- `GET /discover`
  - Returns ranked suggestions with compatibility explanations.
- `GET /profiles/:profileId`
  - Returns a full match explanation and records a `SeeMore` event.
- `POST /profiles/:userId/like`
  - Body: `{ "type": "like" | "super_like" }`
  - Creates a private like and creates a match if reciprocal.
- `POST /profiles/:userId/pass`
  - Privately passes on a profile.
- `POST /passes/undo`
  - Restores the last pass.
- `GET /likes`
  - Returns private inbound likes.
- `GET /matches`
  - Returns mutual matches.

## Messaging

- `GET /matches/:matchId/messages`
  - Returns messages for a mutual match.
- `GET /matches/:matchId/conversation`
  - Returns messages, deterministic conversation starters, and conversation health metrics.
- WebSocket `/ws?token=<token>`
  - `typing`: `{ "type": "typing", "matchId": string }`
  - `message`: `{ "type": "message", "matchId": string, "body": string }`
  - `read`: `{ "type": "read", "matchId": string }`

## Safety

- `POST /reports`
  - Body: `{ "reportedUserId": string, "reason": string, "details": string }`
- `POST /block`
  - Body: `{ "blockedUserId": string }`
- `PUT /settings`
  - Body supports `readReceipts`, `screenshotWarning`, `hidden`, and `paused`.
- `GET /admin/reports`
  - Returns the moderation queue.

## Phase 2 Intelligence

- `GET /trust`
  - Returns email verification state, photo verification state, profile completeness, low-effort status, trust score, badges, and reasons.
- `POST /trust/photo-verification`
  - Completes the optional demo photo verification flow.
- `GET /analytics/match-quality`
  - Returns match success rate, reply rate, average conversation length, top adaptive traits, and low-effort warnings.
