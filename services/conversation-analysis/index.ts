import type { ConversationMetrics, ConversationStarter, Match, Message, Profile } from "../../shared/types";

function minutesBetween(left: string, right: string) {
  return Math.abs(new Date(right).getTime() - new Date(left).getTime()) / 60000;
}

export function analyzeConversation(match: Match, allMessages: Message[]): ConversationMetrics {
  const messages = allMessages.filter((message) => message.matchId === match.id).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  if (!messages.length) {
    return { matchId: match.id, messageCount: 0, averageMessageLength: 0, balanceScore: 1, averageResponseMinutes: 0, replyRate: 0, ghostingRisk: 0.35, status: "fading", nudge: "Want to start with one thoughtful question?" };
  }
  const counts = new Map(match.users.map((userId) => [userId, 0]));
  messages.forEach((message) => counts.set(message.fromUserId, (counts.get(message.fromUserId) || 0) + 1));
  const values = [...counts.values()];
  const total = messages.length;
  const balanceScore = total <= 1 ? 0.5 : Math.min(...values) / Math.max(...values, 1);
  const averageMessageLength = Math.round(messages.reduce((sum, message) => sum + message.body.length, 0) / total);
  const responseGaps = messages.slice(1).filter((message, index) => message.fromUserId !== messages[index].fromUserId).map((message, index) => minutesBetween(messages[index].createdAt, message.createdAt));
  const averageResponseMinutes = responseGaps.length ? Math.round(responseGaps.reduce((sum, gap) => sum + gap, 0) / responseGaps.length) : 0;
  const replyRate = total <= 1 ? 0 : Math.round((responseGaps.length / (total - 1)) * 100) / 100;
  const lastMessageHours = (Date.now() - new Date(messages[messages.length - 1].createdAt).getTime()) / 3600000;
  const ghostingRisk = Math.min(1, Math.round((lastMessageHours / 72 + (1 - replyRate) + (1 - balanceScore)) * 33) / 100);
  const status = ghostingRisk > 0.74 ? "dead" : balanceScore < 0.38 ? "one_sided" : ghostingRisk > 0.48 ? "fading" : "healthy";
  const nudge = status === "healthy" ? "This conversation has a balanced rhythm." : status === "one_sided" ? "Want to invite a more mutual back-and-forth?" : "Want to keep this going with a simple question?";
  return { matchId: match.id, messageCount: total, averageMessageLength, balanceScore, averageResponseMinutes, replyRate, ghostingRisk, status, nudge };
}

export function generateConversationStarters(match: Match, profiles: Profile[], existing: ConversationStarter[]) {
  const found = existing.filter((starter) => starter.matchId === match.id);
  if (found.length) return found;
  const [left, right] = match.users.map((userId) => profiles.find((profile) => profile.userId === userId)).filter(Boolean) as Profile[];
  if (!left || !right) return [];
  const sharedInterests = left.interests.filter((interest) => right.interests.includes(interest));
  const sharedValues = left.values.filter((value) => right.values.includes(value));
  const prompt = right.prompts[0] || left.prompts[0];
  const starters: ConversationStarter[] = [
    sharedInterests[0] ? { id: `starter-${match.id}-1`, matchId: match.id, text: `You both like ${sharedInterests[0]}. What made that stick for you?`, source: "shared_interest", createdAt: new Date().toISOString() } : null,
    sharedValues[0] ? { id: `starter-${match.id}-2`, matchId: match.id, text: `You both named ${sharedValues[0]} as important. What does that look like in real life for you?`, source: "personality_value", createdAt: new Date().toISOString() } : null,
    prompt ? { id: `starter-${match.id}-3`, matchId: match.id, text: `${right.displayName} mentioned "${prompt.answer}" — what part of that would you ask about first?`, source: "prompt_bridge", createdAt: new Date().toISOString() } : null
  ].filter(Boolean) as ConversationStarter[];
  existing.push(...starters);
  return starters;
}

export function isCopyPasteMessage(body: string, priorMessages: Message[], userId: string) {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
  const current = normalize(body);
  if (current.length < 16) return false;
  return priorMessages.filter((message) => message.fromUserId === userId).some((message) => {
    const previous = normalize(message.body);
    if (!previous) return false;
    const shared = current.split(" ").filter((word) => previous.includes(word)).length;
    return shared / Math.max(current.split(" ").length, 1) > 0.82;
  });
}
