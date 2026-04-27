import type { MatchExplanation, Profile, RelationshipGoal, ResponseTime } from "./types";

const weights = {
  interests: 20,
  responseTime: 15,
  goals: 20,
  lifestyle: 15,
  communication: 15,
  distance: 15,
  values: 15,
  promptDepth: 8,
  bioEffort: 6,
  weekendRhythm: 7,
  relationshipReadiness: 10,
  conversationPotential: 8,
  valueTone: 7,
  ageStage: 6,
  personalityTest: 14
};

const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);

function overlap<T>(left: T[], right: T[]) {
  const rightSet = new Set(right);
  return left.filter((item) => rightSet.has(item));
}

function ratio<T>(left: T[], right: T[]) {
  const unique = new Set([...left, ...right]);
  if (unique.size === 0) return 0.5;
  return overlap(left, right).length / unique.size;
}

function distanceKm(a: Profile, b: Profile) {
  const radius = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const hav =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  return radius * 2 * Math.atan2(Math.sqrt(hav), Math.sqrt(1 - hav));
}

function responseScore(a: ResponseTime, b: ResponseTime) {
  const order: ResponseTime[] = ["minutes", "hours", "daily", "few_days"];
  const gap = Math.abs(order.indexOf(a) - order.indexOf(b));
  return Math.max(0, 1 - gap * 0.34);
}

function communicationScore(a: Profile, b: Profile) {
  if (a.communicationStyle === b.communicationStyle) return 1;
  const compatible = new Set(["direct:steady", "steady:reflective", "expressive:playful", "direct:reflective"]);
  const key = [a.communicationStyle, b.communicationStyle].sort().join(":");
  return compatible.has(key) ? 0.74 : 0.42;
}

function textDepth(text: string, targetWords = 28) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (!words) return 0;
  return Math.max(0, Math.min(1, words / targetWords));
}

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function promptDepthScore(a: Profile, b: Profile) {
  const depth = (profile: Profile) => {
    const answers = profile.prompts.map((prompt) => textDepth(prompt.answer, 18));
    const countScore = Math.min(1, profile.prompts.length / 3);
    return average([...answers, countScore]);
  };
  return average([depth(a), depth(b)]);
}

function bioEffortScore(a: Profile, b: Profile) {
  return average([textDepth(a.bio, 35), textDepth(b.bio, 35)]);
}

function weekendRhythmScore(a: Profile, b: Profile) {
  const rhythmWords = ["early", "night", "weekend", "active", "home", "city", "family", "routine", "spontaneous", "dog", "budget"];
  const pick = (profile: Profile) => profile.lifestyle.filter((item) => rhythmWords.some((word) => item.toLowerCase().includes(word)));
  return ratio(pick(a), pick(b));
}

function relationshipReadinessScore(a: Profile, b: Profile) {
  const committedGoals = new Set(["life_partner", "long_term", "intentional_dating"]);
  const readiness = (profile: Profile) => {
    const goalScore = profile.relationshipGoals.filter((goal) => committedGoals.has(goal)).length / Math.max(profile.relationshipGoals.length, 1);
    const intentScore = profile.datingIntent === "serious_relationship" ? 1 : profile.datingIntent === "casual_dating" ? 0.32 : 0.56;
    const promptSignal = profile.prompts.some((prompt) => /relationship|partner|date|meet|future|ready|healthy/i.test(`${prompt.question} ${prompt.answer}`)) ? 1 : 0.55;
    return average([goalScore, intentScore, promptSignal]);
  };
  return 1 - Math.abs(readiness(a) - readiness(b));
}

function conversationPotentialScore(a: Profile, b: Profile) {
  const sharedInterests = ratio(a.interests, b.interests);
  const promptQuestions = average([
    a.prompts.some((prompt) => prompt.answer.includes("?")) ? 1 : 0.58,
    b.prompts.some((prompt) => prompt.answer.includes("?")) ? 1 : 0.58
  ]);
  const combinedDepth = promptDepthScore(a, b);
  return average([sharedInterests, promptQuestions, combinedDepth]);
}

function valueToneScore(a: Profile, b: Profile) {
  const emotionalWords = ["kindness", "emotional maturity", "growth", "privacy", "community", "family", "curiosity", "humor", "respect", "loyalty"];
  const pick = (profile: Profile) => profile.values.filter((value) => emotionalWords.some((word) => value.toLowerCase().includes(word)));
  return ratio(pick(a), pick(b));
}

function ageStageScore(a: Profile, b: Profile) {
  const gap = Math.abs(a.age - b.age);
  if (gap <= 3) return 1;
  if (gap <= 7) return 0.82;
  if (gap <= 12) return 0.58;
  return 0.35;
}

function dealbreakerPenalty(a: Profile, b: Profile) {
  const combinedA = [...b.lifestyle, ...b.relationshipGoals, ...b.values].map(String);
  const combinedB = [...a.lifestyle, ...a.relationshipGoals, ...a.values].map(String);
  const conflicts =
    a.dealbreakers.filter((item) => combinedA.includes(item)).length +
    b.dealbreakers.filter((item) => combinedB.includes(item)).length;
  return Math.min(35, conflicts * 18);
}

function readableGoal(goal: RelationshipGoal) {
  return goal.replaceAll("_", " ");
}

export function explainMatch(viewer: Profile, candidate: Profile): MatchExplanation {
  const sharedInterests = overlap(viewer.interests, candidate.interests);
  const matchedGoals = overlap(viewer.relationshipGoals, candidate.relationshipGoals);
  const km = distanceKm(viewer, candidate);
  const maxDistance = Math.min(viewer.distancePreferenceKm, candidate.distancePreferenceKm);

  const categoryScores = {
    interests: ratio(viewer.interests, candidate.interests),
    responseTime: responseScore(viewer.likelyResponseTime, candidate.likelyResponseTime),
    goals: ratio(viewer.relationshipGoals, candidate.relationshipGoals),
    lifestyle: ratio(viewer.lifestyle, candidate.lifestyle),
    communication: communicationScore(viewer, candidate),
    distance: km <= maxDistance ? 1 : Math.max(0, 1 - (km - maxDistance) / Math.max(maxDistance, 1)),
    values: ratio(viewer.values, candidate.values),
    promptDepth: promptDepthScore(viewer, candidate),
    bioEffort: bioEffortScore(viewer, candidate),
    weekendRhythm: weekendRhythmScore(viewer, candidate),
    relationshipReadiness: relationshipReadinessScore(viewer, candidate),
    conversationPotential: conversationPotentialScore(viewer, candidate),
    valueTone: valueToneScore(viewer, candidate),
    ageStage: ageStageScore(viewer, candidate),
    personalityTest: 0.5
  };

  const weighted =
    Object.entries(categoryScores).reduce((sum, [key, value]) => {
      return sum + value * weights[key as keyof typeof weights];
    }, 0) / totalWeight;
  const penalty = dealbreakerPenalty(viewer, candidate);
  const score = Math.max(0, Math.min(100, Math.round(weighted * 100 - penalty)));

  const possibleDifferences = [
    categoryScores.communication < 0.6 ? `Communication style: ${candidate.communicationStyle}` : "",
    categoryScores.responseTime < 0.7 ? `Response pace: ${candidate.likelyResponseTime.replace("_", " ")}` : "",
    categoryScores.distance < 0.75 ? `${Math.round(km)} km away` : "",
    categoryScores.values < 0.45 ? "Some values answers differ" : "",
    categoryScores.weekendRhythm < 0.45 ? "Weekend rhythm may need a conversation" : "",
    categoryScores.relationshipReadiness < 0.55 ? "Relationship readiness signals differ" : "",
    categoryScores.ageStage < 0.6 ? "Different age or life-stage range" : ""
  ].filter(Boolean);

  const reasons = [
    sharedInterests.length ? `You both care about ${sharedInterests.slice(0, 3).join(", ")}.` : "",
    matchedGoals.length ? `You both selected ${matchedGoals.map(readableGoal).join(", ")}.` : "",
    categoryScores.lifestyle > 0.55 ? "Your lifestyle rhythms look compatible." : "",
    categoryScores.communication > 0.7 ? "Your communication preferences should feel natural together." : "",
    categoryScores.conversationPotential > 0.62 ? "There are several easy conversation entry points." : "",
    categoryScores.promptDepth > 0.62 ? "Both profiles include enough prompt detail for better recommendations." : "",
    categoryScores.relationshipReadiness > 0.72 ? "Your relationship readiness signals are closely aligned." : "",
    penalty > 0 ? "A dealbreaker overlap reduced this recommendation." : ""
  ].filter(Boolean);

  return {
    score,
    confidence: 55,
    sharedInterests,
    matchedGoals,
    possibleDifferences,
    reasons,
    adaptiveReasons: [],
    hiddenSignals: [],
    categoryScores,
    dynamicWeights: weights,
    dealbreakerPenalty: penalty,
    lowEffortPenalty: 0,
    intentPenalty: 0
  };
}
