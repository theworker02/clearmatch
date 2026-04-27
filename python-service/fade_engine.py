from __future__ import annotations

from collections import Counter, defaultdict
from datetime import datetime, timezone
from math import exp
from statistics import mean
from typing import Iterable

from models import FadeMessage


POSITIVE_WORDS = {"great", "love", "excited", "fun", "happy", "yes", "favorite", "glad", "beautiful", "interesting"}
LOW_EFFORT_WORDS = {"ok", "okay", "k", "lol", "haha", "yeah", "yep", "sure", "cool", "nice"}


def _parse_time(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    parsed = datetime.fromisoformat(normalized)
    if parsed.tzinfo is None:
        return parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return max(low, min(high, value))


def _weighted_mean(values: Iterable[float]) -> float:
    values = list(values)
    if not values:
        return 0.0
    weights = [exp(index / max(len(values) - 1, 1)) for index in range(len(values))]
    return sum(value * weight for value, weight in zip(values, weights)) / sum(weights)


def _score_response_delay(messages: list[FadeMessage]) -> float:
    gaps = []
    for previous, current in zip(messages, messages[1:]):
        if previous.fromUserId == current.fromUserId:
            continue
        gap_hours = (_parse_time(current.createdAt) - _parse_time(previous.createdAt)).total_seconds() / 3600
        gaps.append(max(0.0, gap_hours))
    if not gaps:
        return 52.0 if len(messages) <= 1 else 32.0
    weighted_gap = _weighted_mean(gaps)
    return _clamp((weighted_gap / 36) * 100)


def _score_frequency_drop(messages: list[FadeMessage]) -> tuple[float, bool]:
    if len(messages) < 4:
        return 25.0, False
    times = [_parse_time(message.createdAt) for message in messages]
    midpoint = times[0] + ((times[-1] - times[0]) / 2)
    early = sum(1 for time in times if time <= midpoint)
    recent = max(0, len(times) - early)
    expected_recent = max(early, 1)
    drop_ratio = max(0.0, (expected_recent - recent) / expected_recent)

    rolling_gaps = [(right - left).total_seconds() / 3600 for left, right in zip(times, times[1:])]
    anomaly = False
    if len(rolling_gaps) >= 4:
      baseline = mean(rolling_gaps[:-2]) or 1
      recent_gap = mean(rolling_gaps[-2:])
      anomaly = recent_gap > baseline * 2.2 and recent_gap > 8

    return _clamp(drop_ratio * 85 + (15 if anomaly else 0)), anomaly


def _score_imbalance(messages: list[FadeMessage], participants: list[str]) -> float:
    if not messages:
        return 50.0
    counts = Counter(message.fromUserId for message in messages)
    for participant in participants:
        counts.setdefault(participant, 0)
    most = max(counts.values() or [1])
    least = min(counts.values() or [0])
    if most == 0:
        return 50.0
    return _clamp((1 - (least / most)) * 100)


def _score_message_depth(messages: list[FadeMessage]) -> float:
    if not messages:
        return 55.0
    depth_scores = []
    for message in messages:
        words = [word.strip(".,!?;:\"'()[]").lower() for word in message.body.split()]
        length_score = _clamp(100 - (len(words) / 22) * 100)
        low_effort_penalty = 18 if words and all(word in LOW_EFFORT_WORDS for word in words[:3]) and len(words) <= 4 else 0
        positive_offset = -8 if any(word in POSITIVE_WORDS for word in words) else 0
        question_offset = -6 if "?" in message.body else 0
        depth_scores.append(_clamp(length_score + low_effort_penalty + positive_offset + question_offset))
    return _weighted_mean(depth_scores)


def _score_inactivity(messages: list[FadeMessage], now: datetime) -> float:
    if not messages:
        return 45.0
    last_activity_hours = (now - _parse_time(messages[-1].createdAt)).total_seconds() / 3600
    return _clamp((last_activity_hours / 96) * 100)


def calculate_fade(messages: list[FadeMessage], participants: list[str], now: datetime | None = None) -> dict:
    now = now or datetime.now(timezone.utc)
    ordered = sorted(messages, key=lambda message: _parse_time(message.createdAt))
    if not ordered:
        return {
            "fade_score": 42,
            "status": "slowing",
            "explanation": "No messages yet, so the conversation needs an opening signal before health can improve.",
            "factors": {
                "response_delay": 52,
                "frequency_drop": 25,
                "imbalance": 50,
                "message_depth": 55,
                "inactivity": 45,
                "anomaly_detected": False
            }
        }

    response_delay = _score_response_delay(ordered)
    frequency_drop, anomaly = _score_frequency_drop(ordered)
    imbalance = _score_imbalance(ordered, participants)
    message_depth = _score_message_depth(ordered)
    inactivity = _score_inactivity(ordered, now)

    fade_score = _clamp(
        response_delay * 0.30
        + frequency_drop * 0.20
        + imbalance * 0.20
        + message_depth * 0.15
        + inactivity * 0.15
    )

    if fade_score >= 70:
        status = "fading"
    elif fade_score >= 42:
        status = "slowing"
    else:
        status = "active"

    reasons = []
    if response_delay >= 58:
        reasons.append("longer response delays")
    if frequency_drop >= 55:
        reasons.append("declining message frequency")
    if imbalance >= 55:
        reasons.append("uneven back-and-forth")
    if message_depth >= 58:
        reasons.append("shorter, lower-depth replies")
    if inactivity >= 58:
        reasons.append("recent inactivity")
    if anomaly:
        reasons.append("a sudden rhythm drop")
    explanation = "Conversation looks healthy with steady recent engagement." if not reasons else "Fade risk is driven by " + ", ".join(reasons[:3]) + "."

    return {
        "fade_score": int(round(fade_score)),
        "status": status,
        "explanation": explanation,
        "factors": {
            "response_delay": round(response_delay, 1),
            "frequency_drop": round(frequency_drop, 1),
            "imbalance": round(imbalance, 1),
            "message_depth": round(message_depth, 1),
            "inactivity": round(inactivity, 1),
            "anomaly_detected": anomaly
        }
    }
