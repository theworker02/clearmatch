# ClearMatch GitHub Release

## v2.0.0 - Premium Portfolio Release

ClearMatch is a private, full-stack dating platform demo built to showcase thoughtful product design, explainable compatibility scoring, trust and safety systems, real-time messaging, and algorithmic depth.

## Release Highlights

- Premium mobile-first interface with dark UI, animated route transitions, swipe feedback, visual badges, tooltips, and polished empty states.
- Full onboarding flow with email/password authentication, age-gated profile setup, photo validation, and a 35-question personality test.
- Personality type badges such as Grounded Connector, Warm Communicator, Curious Explorer, Intentional Builder, Reflective Romantic, and Playful Catalyst.
- Explainable matching engine with weighted compatibility scoring, adaptive behavior signals, confidence scoring, dealbreaker penalties, and match quality breakdowns.
- Private dating model with no public feed, no followers, no reposting, no mutual-friend display, and no required social media linking.
- Likes, passes, standout likes, undo last pass, compliments, mutual match creation, and WebSocket messaging.
- Conversation intelligence with deterministic starters, message reactions, reply affordances, unread states, and a Python FastAPI conversation fade service.
- Trust and safety tools including block, report, hide profile, pause account, screenshot warning settings, and moderation queue.
- Separate `frontend` and `backend` workspaces plus a standalone `python-service`.

## Demo

```bash
npm install
python -m pip install -r python-service/requirements.txt
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

Demo account:

```text
demo@clearmatch.app
ClearMatch123!
```

## Docker Demo

```bash
docker compose up --build
```

Open `http://localhost:5173`.

The containerized release runs three services:

- `frontend`: nginx serving the Vite production build and proxying app traffic.
- `backend`: Express/WebSocket API with local upload volume support.
- `python-service`: FastAPI conversation fade scoring microservice.

## Verification

```bash
npm run build
npm run typecheck
python -m py_compile services/matching-engine-v2/matching_v2.py python-service/app.py python-service/fade_engine.py python-service/models.py
docker compose config
```

## Screenshot Previews

The README includes updated UI previews from:

- `docs/screenshots/landing.png`
- `docs/screenshots/discover.png`
- `docs/screenshots/match-details.png`
- `docs/screenshots/personality-test.png`
