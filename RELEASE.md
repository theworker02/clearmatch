# ClearMatch Release Notes

## v2.0.0 - Portfolio Release

ClearMatch is now a full-stack, locally demoable dating app with a premium mobile-first UI, explainable matching, trust and safety tooling, real-time messaging, and a Python-powered conversation health service.

### Highlights

- Private dating product model with no public feed, followers, reposts, mutual-friend display, or required social linking.
- Vite React frontend with premium dark UI, animated route transitions, swipe feedback, badges, tooltips, and mobile-style navigation.
- Node.js Express backend with email/password auth, profile setup, photo validation, likes, passes, matches, messaging, reports, blocks, settings, and moderation routes.
- Advanced matching engine with adaptive behavioral weights, personality-test alignment, deeper scoring signals, confidence scores, and human-readable match explanations.
- First-run personality test that saves onboarding answers and feeds compatibility scoring.
- Compliments system, match quality screens, conversation starters, message reactions, reply affordances, unread states, and chat safety controls.
- FastAPI conversation fade microservice with response delay, frequency drop, balance, message depth, inactivity, time decay, and anomaly detection.
- Documentation for API routes, matching, safety, privacy, UI system, conversation engine, and trust system.

### Local Demo

```bash
npm install
python -m pip install -r python-service/requirements.txt
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

Demo login:

```text
demo@clearmatch.app
ClearMatch123!
```

### Verification

- `npm run build`
- `python -m py_compile services/matching-engine-v2/matching_v2.py python-service/app.py python-service/fade_engine.py python-service/models.py`

### GitHub Release Description

Use this release to showcase ClearMatch as a production-minded full-stack portfolio app. The project demonstrates frontend product polish, backend architecture, real-time WebSocket messaging, explainable matching, behavioral adaptation, trust and safety design, and a Python algorithmic microservice.
