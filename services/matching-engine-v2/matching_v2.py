from __future__ import annotations

from dataclasses import dataclass, field
from math import atan2, cos, radians, sin, sqrt
from typing import Iterable


@dataclass(frozen=True)
class ProfileVector:
    user_id: str
    interests: tuple[str, ...]
    goals: tuple[str, ...]
    lifestyle: tuple[str, ...]
    values: tuple[str, ...]
    communication_style: str
    response_time: str
    intent: str
    latitude: float
    longitude: float
    distance_preference_km: int
    dealbreakers: tuple[str, ...] = field(default_factory=tuple)


BASE_WEIGHTS = {
    "interests": 20,
    "response_time": 15,
    "goals": 20,
    "lifestyle": 15,
    "communication": 15,
    "distance": 15,
    "values": 15,
    "intent": 24,
    "prompt_depth": 8,
    "bio_effort": 6,
    "weekend_rhythm": 7,
    "relationship_readiness": 10,
    "conversation_potential": 8,
    "value_tone": 7,
    "age_stage": 6,
    "personality_test": 14,
}


def overlap_ratio(left: Iterable[str], right: Iterable[str]) -> float:
    left_set = set(left)
    right_set = set(right)
    union = left_set | right_set
    if not union:
        return 0.5
    return len(left_set & right_set) / len(union)


def distance_km(left: ProfileVector, right: ProfileVector) -> float:
    radius = 6371
    d_lat = radians(right.latitude - left.latitude)
    d_lon = radians(right.longitude - left.longitude)
    lat1 = radians(left.latitude)
    lat2 = radians(right.latitude)
    hav = sin(d_lat / 2) ** 2 + sin(d_lon / 2) ** 2 * cos(lat1) * cos(lat2)
    return radius * 2 * atan2(sqrt(hav), sqrt(1 - hav))


def response_score(left: str, right: str) -> float:
    order = ["minutes", "hours", "daily", "few_days"]
    gap = abs(order.index(left) - order.index(right))
    return max(0, 1 - gap * 0.34)


def communication_score(left: str, right: str) -> float:
    if left == right:
        return 1
    compatible = {":".join(sorted(pair)) for pair in [
        ("direct", "steady"),
        ("steady", "reflective"),
        ("expressive", "playful"),
        ("direct", "reflective"),
    ]}
    return 0.74 if ":".join(sorted((left, right))) in compatible else 0.42


def intent_score(left: str, right: str) -> float:
    if left == right:
        return 1
    if "just_exploring" in (left, right):
        return 0.45
    return 0.08


def age_stage_score(left_age: int | None, right_age: int | None) -> float:
    if left_age is None or right_age is None:
        return 0.72
    gap = abs(left_age - right_age)
    if gap <= 3:
        return 1
    if gap <= 7:
        return 0.82
    if gap <= 12:
        return 0.58
    return 0.35


def score_profiles(left: ProfileVector, right: ProfileVector, weights: dict[str, int] | None = None) -> dict[str, object]:
    active_weights = weights or BASE_WEIGHTS
    km = distance_km(left, right)
    max_distance = min(left.distance_preference_km, right.distance_preference_km)
    categories = {
        "interests": overlap_ratio(left.interests, right.interests),
        "response_time": response_score(left.response_time, right.response_time),
        "goals": overlap_ratio(left.goals, right.goals),
        "lifestyle": overlap_ratio(left.lifestyle, right.lifestyle),
        "communication": communication_score(left.communication_style, right.communication_style),
        "distance": 1 if km <= max_distance else max(0, 1 - (km - max_distance) / max(max_distance, 1)),
        "values": overlap_ratio(left.values, right.values),
        "intent": intent_score(left.intent, right.intent),
        "prompt_depth": 0.72,
        "bio_effort": 0.72,
        "weekend_rhythm": overlap_ratio(
            [item for item in left.lifestyle if any(word in item for word in ("early", "weekend", "active", "home", "city", "routine"))],
            [item for item in right.lifestyle if any(word in item for word in ("early", "weekend", "active", "home", "city", "routine"))],
        ),
        "relationship_readiness": overlap_ratio(left.goals, right.goals) * 0.55 + intent_score(left.intent, right.intent) * 0.45,
        "conversation_potential": overlap_ratio(left.interests, right.interests) * 0.65 + overlap_ratio(left.values, right.values) * 0.35,
        "value_tone": overlap_ratio(left.values, right.values),
        "age_stage": 0.72,
        "personality_test": 0.5,
    }
    weighted = sum(categories[key] * active_weights[key] for key in categories) / sum(active_weights.values())
    dealbreaker_hits = len(set(left.dealbreakers) & (set(right.lifestyle) | set(right.goals) | set(right.values)))
    dealbreaker_hits += len(set(right.dealbreakers) & (set(left.lifestyle) | set(left.goals) | set(left.values)))
    dealbreaker_penalty = min(35, dealbreaker_hits * 18)
    intent_penalty = 28 if categories["intent"] < 0.2 else 12 if categories["intent"] < 0.5 else 0
    score = max(0, min(100, round(weighted * 100 - dealbreaker_penalty - intent_penalty)))
    return {
        "score": score,
        "category_scores": categories,
        "dealbreaker_penalty": dealbreaker_penalty,
        "intent_penalty": intent_penalty,
        "distance_km": round(km, 1),
    }


if __name__ == "__main__":
    maya = ProfileVector(
        user_id="maya",
        interests=("coffee walks", "live jazz", "cooking"),
        goals=("long_term", "life_partner"),
        lifestyle=("early riser", "active"),
        values=("kindness", "privacy"),
        communication_style="steady",
        response_time="hours",
        intent="serious_relationship",
        latitude=40.6782,
        longitude=-73.9442,
        distance_preference_km=40,
    )
    noah = ProfileVector(
        user_id="noah",
        interests=("coffee walks", "architecture", "live jazz"),
        goals=("long_term", "life_partner"),
        lifestyle=("early riser", "active"),
        values=("kindness", "community"),
        communication_style="steady",
        response_time="hours",
        intent="serious_relationship",
        latitude=40.7178,
        longitude=-74.0431,
        distance_preference_km=35,
    )
    print(score_profiles(maya, noah))
