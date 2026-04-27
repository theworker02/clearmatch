from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from fade_engine import calculate_fade
from models import FadeRequest, FadeResponse

app = FastAPI(title="ClearMatch Conversation Fade Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"ok": True, "service": "conversation-fade"}


@app.post("/fade-score", response_model=FadeResponse)
def fade_score(payload: FadeRequest):
    return calculate_fade(payload.messages, payload.participants)
