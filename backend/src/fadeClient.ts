import type { Match, Message } from "../../shared/types";

export type FadeResult = {
  fade_score: number;
  status: "active" | "slowing" | "fading";
  explanation: string;
  factors: Record<string, number | boolean>;
};

const cache = new Map<string, { expiresAt: number; value: FadeResult }>();
const serviceUrl = process.env.PYTHON_FADE_SERVICE_URL || "http://localhost:8000";
const cacheMs = Number(process.env.FADE_SCORE_CACHE_MS || 45_000);

function fallbackFade(match: Match, messages: Message[]): FadeResult {
  const matchMessages = messages.filter((message) => message.matchId === match.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const last = matchMessages.at(-1);
  const inactiveHours = last ? (Date.now() - new Date(last.createdAt).getTime()) / 3600000 : 48;
  const counts = new Map(match.users.map((userId) => [userId, 0]));
  matchMessages.forEach((message) => counts.set(message.fromUserId, (counts.get(message.fromUserId) || 0) + 1));
  const values = [...counts.values()];
  const imbalance = values.length ? 1 - Math.min(...values) / Math.max(...values, 1) : 0.5;
  const depth = matchMessages.length ? Math.max(0, 1 - matchMessages.reduce((sum, message) => sum + message.body.length, 0) / matchMessages.length / 120) : 0.55;
  const fade = Math.min(100, Math.round(inactiveHours / 96 * 35 + imbalance * 35 + depth * 30));
  return {
    fade_score: fade,
    status: fade >= 70 ? "fading" : fade >= 42 ? "slowing" : "active",
    explanation: "Python fade service unavailable; using local fallback until the service reconnects.",
    factors: { response_delay: 0, frequency_drop: 0, imbalance: Math.round(imbalance * 100), message_depth: Math.round(depth * 100), inactivity: Math.round(Math.min(100, inactiveHours / 96 * 100)), anomaly_detected: false }
  };
}

export async function getConversationFade(match: Match, messages: Message[]): Promise<FadeResult> {
  const relevant = messages.filter((message) => message.matchId === match.id);
  const newestTimestamp = relevant.at(-1)?.createdAt || "none";
  const cacheKey = `${match.id}:${relevant.length}:${newestTimestamp}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  try {
    const response = await fetch(`${serviceUrl}/fade-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: relevant, participants: match.users }),
      signal: AbortSignal.timeout(1200)
    });
    if (!response.ok) throw new Error(`Fade service returned ${response.status}`);
    const value = await response.json() as FadeResult;
    cache.set(cacheKey, { value, expiresAt: Date.now() + cacheMs });
    return value;
  } catch {
    const value = fallbackFade(match, messages);
    cache.set(cacheKey, { value, expiresAt: Date.now() + Math.min(cacheMs, 10_000) });
    return value;
  }
}
