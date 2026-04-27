import { explainMatch as explainBaseMatch } from "../../shared/matching";
import type { MatchExplanation, Profile, PromptAnswer, UserBehavior } from "../../shared/types";
import { dynamicPreferenceWeights } from "../behavior-tracking/index.ts";
import { isLowEffortProfile } from "../trust-system/index.ts";

function overlap(left: string[], right: string[]) {
  return left.filter((item) => right.includes(item));
}

function clamp(value: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value));
}

function normalizeWords(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function answerSimilarity(left: PromptAnswer["value"], right: PromptAnswer["value"]) {
  if (typeof left === "number" && typeof right === "number") return clamp(1 - Math.abs(left - right) / 9);
  if (typeof left === "boolean" && typeof right === "boolean") return left === right ? 1 : 0.25;
  if (Array.isArray(left) && Array.isArray(right)) {
    const union = new Set([...left, ...right]);
    if (!union.size) return 0.5;
    return left.filter((item) => right.includes(item)).length / union.size;
  }
  const leftText = String(left).trim().toLowerCase();
  const rightText = String(right).trim().toLowerCase();
  if (!leftText || !rightText) return 0.5;
  if (leftText === rightText) return 1;
  const leftWords = new Set(normalizeWords(leftText));
  const rightWords = new Set(normalizeWords(rightText));
  const union = new Set([...leftWords, ...rightWords]);
  if (!union.size) return 0.5;
  const overlapScore = [...leftWords].filter((word) => rightWords.has(word)).length / union.size;
  return clamp(Math.max(0.32, overlapScore));
}

function personalityTestScore(viewerUserId: string, candidateUserId: string, answers: PromptAnswer[]) {
  const viewerAnswers = answers.filter((answer) => answer.userId === viewerUserId);
  const candidateAnswers = answers.filter((answer) => answer.userId === candidateUserId);
  const candidateByQuestion = new Map(candidateAnswers.map((answer) => [answer.questionId, answer]));
  const comparable = viewerAnswers
    .map((answer) => {
      const candidate = candidateByQuestion.get(answer.questionId);
      return candidate ? answerSimilarity(answer.value, candidate.value) : null;
    })
    .filter((value): value is number => typeof value === "number");
  if (!comparable.length) return 0.5;
  return comparable.reduce((sum, value) => sum + value, 0) / comparable.length;
}

export function explainMatchV2(viewer: Profile, candidate: Profile, behavior: UserBehavior[], profiles: Profile[], answers: PromptAnswer[] = []): MatchExplanation {
  const base = explainBaseMatch(viewer, candidate);
  const adaptive = dynamicPreferenceWeights(viewer.userId, behavior, profiles);
  const dynamicWeights = adaptive.weights;
  const totalWeight = Object.values(dynamicWeights).reduce((sum, value) => sum + value, 0);
  const intentScore = viewer.datingIntent === candidate.datingIntent ? 1 : viewer.datingIntent === "just_exploring" || candidate.datingIntent === "just_exploring" ? 0.45 : 0.08;
  const personalityScore = personalityTestScore(viewer.userId, candidate.userId, answers);
  const categoryScores = { ...base.categoryScores, intent: intentScore, personalityTest: personalityScore };
  const weighted =
    Object.entries(categoryScores).reduce((sum, [key, value]) => {
      return sum + value * (dynamicWeights[key as keyof typeof dynamicWeights] || 0);
    }, 0) / totalWeight;
  const intentPenalty = intentScore < 0.2 ? 28 : intentScore < 0.5 ? 12 : 0;
  const lowEffortPenalty = isLowEffortProfile(candidate) ? 16 : 0;
  const hiddenSignals = [
    overlap(candidate.interests, adaptive.topTraits).length ? `Activity signal: you often engage with ${overlap(candidate.interests, adaptive.topTraits).join(", ")}.` : "",
    overlap(candidate.lifestyle, adaptive.topTraits).length ? `Lifestyle signal: ${overlap(candidate.lifestyle, adaptive.topTraits).join(", ")} has been showing up in your likes.` : "",
    adaptive.topTraits.includes(candidate.datingIntent.replaceAll("_", " ")) ? "Intent signal: your activity favors this relationship intent." : "",
    base.categoryScores.promptDepth > 0.62 ? "Prompt depth signal: both profiles give the matcher more meaningful context." : "",
    base.categoryScores.conversationPotential > 0.62 ? "Conversation signal: shared interests and prompt detail create easier openers." : "",
    base.categoryScores.relationshipReadiness > 0.72 ? "Readiness signal: goals, intent, and profile language point in a similar direction." : "",
    base.categoryScores.weekendRhythm > 0.55 ? "Rhythm signal: day-to-day lifestyle clues suggest a compatible pace." : "",
    base.categoryScores.valueTone > 0.55 ? "Value tone signal: the emotional tone of your values has healthy overlap." : "",
    personalityScore > 0.66 ? "Personality test signal: your deeper answers point toward a similar emotional pace." : ""
  ].filter(Boolean);
  const adaptiveReasons = adaptive.topTraits.slice(0, 3).map((trait) => `Based on your activity, ${trait} is becoming more important in your recommendations.`);
  const confidence = Math.max(35, Math.min(96, Math.round(52 + behavior.filter((event) => event.userId === viewer.userId).length * 5 + base.sharedInterests.length * 4 - lowEffortPenalty)));
  const score = Math.max(0, Math.min(100, Math.round(weighted * 100 - base.dealbreakerPenalty - intentPenalty - lowEffortPenalty)));
  return {
    ...base,
    score,
    confidence,
    adaptiveReasons,
    hiddenSignals,
    categoryScores,
    dynamicWeights,
    lowEffortPenalty,
    intentPenalty,
    possibleDifferences: [
      ...base.possibleDifferences,
      viewer.datingIntent !== candidate.datingIntent ? `Intent: ${candidate.datingIntent.replaceAll("_", " ")}` : "",
      base.categoryScores.promptDepth < 0.4 ? "Profile depth: one profile may need fuller prompts" : "",
      base.categoryScores.conversationPotential < 0.45 ? "Conversation potential may rely on asking new questions" : "",
      base.categoryScores.valueTone < 0.45 ? "Value tone differs in this profile" : "",
      personalityScore < 0.4 ? "Personality test answers suggest a different relationship rhythm" : ""
    ].filter(Boolean)
  };
}
