from pydantic import BaseModel, Field
from typing import List, Optional


class FadeMessage(BaseModel):
    id: Optional[str] = None
    matchId: Optional[str] = None
    fromUserId: str
    body: str
    createdAt: str


class FadeRequest(BaseModel):
    messages: List[FadeMessage] = Field(default_factory=list)
    participants: List[str] = Field(default_factory=list)


class FadeResponse(BaseModel):
    fade_score: int
    status: str
    explanation: str
    factors: dict
