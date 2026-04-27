# Conversation Fade Service

ClearMatch runs a standalone FastAPI service in `python-service/` to calculate Conversation Fade Percentage.

## Endpoint

`POST /fade-score`

Input:

```json
{
  "participants": ["user-a", "user-b"],
  "messages": [
    { "fromUserId": "user-a", "body": "Want to compare favorite trails?", "createdAt": "2026-04-26T20:00:00Z" }
  ]
}
```

Output:

```json
{
  "fade_score": 59,
  "status": "slowing",
  "explanation": "Fade risk is driven by longer response delays, shorter, lower-depth replies.",
  "factors": {
    "response_delay": 100,
    "frequency_drop": 25,
    "imbalance": 50,
    "message_depth": 69.7,
    "inactivity": 25,
    "anomaly_detected": false
  }
}
```

## Algorithm

The score is a weighted blend:

- Response delay: 30%
- Frequency drop: 20%
- Conversation imbalance: 20%
- Message depth: 15%
- Recent inactivity: 15%

The engine uses time-decay weighting so recent gaps and short replies matter more, rolling gap averages to spot sudden rhythm drops, and a simple low-effort/sentiment heuristic to avoid treating every short message equally.

## Backend Integration

The Node backend calls `PYTHON_FADE_SERVICE_URL` from `backend/src/fadeClient.ts`, caches results briefly with `FADE_SCORE_CACHE_MS`, and attaches `fadePercentage`, `fadeStatus`, `fadeExplanation`, and `fadeFactors` to `ConversationMetrics`.

If the Python service is unavailable, the backend uses a local fallback so chat still renders, but the explanation clearly says the Python service is unavailable.
