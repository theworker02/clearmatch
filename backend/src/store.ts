import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { z } from "zod";
import { dynamicPreferenceWeights, recordBehavior } from "../../services/behavior-tracking/index.ts";
import { analyzeConversation, generateConversationStarters, isCopyPasteMessage } from "../../services/conversation-analysis/index.ts";
import { explainMatchV2 } from "../../services/matching-engine-v2/index.ts";
import { buildTrustScore, isLowEffortProfile } from "../../services/trust-system/index.ts";
import type { ComplimentCategory, DiscoveryPreferences, Like, Match, MatchQualityBreakdown, Message, Profile, Report, User, UserSettings } from "../../shared/types";
import { getConversationFade } from "./fadeClient";
import { behaviorEvents, blocks, compliments, conversationStarters, demoUser, discoveryPreferences, likes, matches, messageReactions, messages, passes, personalityResults, profiles, promptAnswers, promptQuestions, reports, seeMore, userSettings, users } from "./seed";

const jwtSecret = process.env.JWT_SECRET || "local-dev-secret";

export const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(10)
});

export const profileSchema = z.object({
  displayName: z.string().min(2),
  age: z.number().int().min(18).max(99),
  city: z.string().min(2),
  bio: z.string().min(20).max(500),
  interests: z.array(z.string()).min(3),
  relationshipGoals: z.array(z.enum(["life_partner", "long_term", "intentional_dating", "friendship_first"])).min(1),
  datingIntent: z.enum(["serious_relationship", "casual_dating", "just_exploring"]),
  lifestyle: z.array(z.string()).min(2),
  values: z.array(z.string()).min(2),
  communicationStyle: z.enum(["steady", "expressive", "direct", "playful", "reflective"]),
  likelyResponseTime: z.enum(["minutes", "hours", "daily", "few_days"]),
  distancePreferenceKm: z.number().int().min(5).max(250),
  dealbreakers: z.array(z.string()),
  prompts: z.array(z.object({ question: z.string(), answer: z.string() })).min(1),
  latitude: z.number().default(40.7128),
  longitude: z.number().default(-74.006)
});

const answerSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])
  }))
});

const complimentSchema = z.object({
  toUserId: z.string(),
  category: z.enum(["profile_answer", "photo", "shared_interest", "personality"]),
  body: z.string().min(20).max(280)
});

const reactionSchema = z.object({
  emoji: z.string().min(1).max(8)
});

function publicUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

export function createToken(user: User) {
  return jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: "7d" });
}

export function getQuestions() {
  return promptQuestions;
}

export function getPersonalityTestQuestions() {
  return promptQuestions;
}

function scoreText(value: string | number | boolean | string[]) {
  return Array.isArray(value) ? value.join(" ").toLowerCase() : String(value).toLowerCase();
}

function derivePersonalityType(answers: typeof promptAnswers) {
  const scores = {
    grounded: 0,
    expressive: 0,
    exploratory: 0,
    intentional: 0,
    reflective: 0,
    playful: 0
  };
  answers.forEach((answer) => {
    const text = scoreText(answer.value);
    if (/quiet|routine|steady|consistent|reliability|loyalty|clear|direct|daily|plans|stable/.test(text)) scores.grounded += 2;
    if (/warm|care|expressive|affection|storytelling|emotion|gentle|kindness|family/.test(text)) scores.expressive += 2;
    if (/spontaneous|exploring|curious|new|adventure|go-with-the-flow|surprise|creative/.test(text)) scores.exploratory += 2;
    if (/serious|relationship|future|healthy|commitment|partner|intentional|ready|maturity/.test(text)) scores.intentional += 2;
    if (/reflect|pause|write|understood|privacy|respect|space|listen|thoughtful/.test(text)) scores.reflective += 2;
    if (/humor|playful|silly|laugh|sarcastic|light|fun/.test(text)) scores.playful += 2;
    if (typeof answer.value === "number") {
      if (answer.questionId.includes("daily") && answer.value >= 7) scores.grounded += 2;
      if (answer.questionId.includes("space") && answer.value >= 7) scores.reflective += 2;
      if (answer.questionId.includes("adventure") && answer.value >= 7) scores.exploratory += 2;
    }
  });
  const top = Object.entries(scores).sort((a, b) => b[1] - a[1])[0]?.[0] || "grounded";
  const results: Record<string, { type: string; summary: string }> = {
    grounded: { type: "Grounded Connector", summary: "Steady, clear, and most comfortable when interest feels consistent." },
    expressive: { type: "Warm Communicator", summary: "Emotionally present, affectionate, and drawn to thoughtful connection." },
    exploratory: { type: "Curious Explorer", summary: "Open, flexible, and energized by discovery without unnecessary pressure." },
    intentional: { type: "Intentional Builder", summary: "Relationship-minded, future-aware, and focused on healthy partnership." },
    reflective: { type: "Reflective Romantic", summary: "Thoughtful, observant, and drawn to depth, respect, and emotional safety." },
    playful: { type: "Playful Catalyst", summary: "Lighthearted, socially warm, and energized by humor and shared momentum." }
  };
  return results[top];
}

export function savePromptAnswers(userId: string, input: unknown) {
  const parsed = answerSchema.parse(input);
  const now = new Date().toISOString();
  parsed.answers.forEach((answer) => {
    const existing = promptAnswers.find((item) => item.userId === userId && item.questionId === answer.questionId);
    if (existing) existing.value = answer.value;
    else promptAnswers.push({ id: `answer-${nanoid(8)}`, userId, questionId: answer.questionId, value: answer.value, createdAt: now });
  });
  return promptAnswers.filter((answer) => answer.userId === userId);
}

export function savePersonalityTest(userId: string, input: unknown) {
  const saved = savePromptAnswers(userId, input);
  const result = derivePersonalityType(saved);
  personalityResults[userId] = result;
  const profile = profileForUser(userId);
  if (profile) {
    profile.personalityType = result.type;
    profile.personalitySummary = result.summary;
  }
  return { answers: saved, personality: result };
}

export function getUserFromToken(token?: string) {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), jwtSecret) as { sub: string };
    return users.find((user) => user.id === decoded.sub) || null;
  } catch {
    return null;
  }
}

export async function signup(email: string, password: string) {
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("Email already registered");
  }
  const user: User = {
    id: `user-${nanoid(8)}`,
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    emailVerified: true,
    readReceipts: true,
    screenshotWarning: true,
    createdAt: new Date().toISOString()
  };
  users.push(user);
  return { user: publicUser(user), token: createToken(user) };
}

export async function login(email: string, password: string) {
  const user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.passwordHash || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error("Invalid email or password");
  }
  return { user: publicUser(user), token: createToken(user) };
}

export function profileForUser(userId: string) {
  return profiles.find((profile) => profile.userId === userId) || null;
}

export function upsertProfile(userId: string, input: z.infer<typeof profileSchema>) {
  const existing = profileForUser(userId);
  const profile: Profile = {
    id: existing?.id || `profile-${nanoid(8)}`,
    userId,
    photos: existing?.photos?.length ? existing.photos : ["/avatars/default.svg"],
    hidden: existing?.hidden || false,
    paused: existing?.paused || false,
    photoVerified: existing?.photoVerified || false,
    personalityType: existing?.personalityType || personalityResults[userId]?.type,
    personalitySummary: existing?.personalitySummary || personalityResults[userId]?.summary,
    ...input
  };
  if (isLowEffortProfile(profile)) {
    throw new Error("Add a fuller bio, at least three interests, and a thoughtful prompt before matching.");
  }
  const index = profiles.findIndex((item) => item.userId === userId);
  if (index >= 0) profiles[index] = profile;
  else profiles.push(profile);
  return profile;
}

export function getDiscover(userId: string) {
  const viewer = profileForUser(userId);
  if (!viewer) return [];
  const blockedIds = new Set(blocks.filter((block) => block.blockerUserId === userId || block.blockedUserId === userId).flatMap((block) => [block.blockerUserId, block.blockedUserId]));
  const acted = new Set([
    ...likes.filter((like) => like.fromUserId === userId).map((like) => like.toUserId),
    ...passes.filter((pass) => pass.fromUserId === userId).map((pass) => pass.toUserId)
  ]);
  return profiles
    .filter((profile) => profile.userId !== userId && !profile.hidden && !profile.paused && !blockedIds.has(profile.userId) && !acted.has(profile.userId))
    .map((profile) => ({
      profile,
      explanation: explainMatchV2(viewer, profile, behaviorEvents, profiles, promptAnswers),
      trust: buildTrustScore(users.find((user) => user.id === profile.userId) || demoUser, profile)
    }))
    .sort((a, b) => b.explanation.score - a.explanation.score);
}

export function getMatchDetails(userId: string, profileId: string) {
  const viewer = profileForUser(userId);
  const candidate = profiles.find((profile) => profile.id === profileId);
  if (!viewer || !candidate) return null;
  recordBehavior(behaviorEvents, { userId, profileId, type: "view", durationMs: 45000 });
  return {
    profile: candidate,
    explanation: explainMatchV2(viewer, candidate, behaviorEvents, profiles, promptAnswers),
    trust: buildTrustScore(users.find((user) => user.id === candidate.userId) || demoUser, candidate)
  };
}

export function createLike(fromUserId: string, toUserId: string, type: Like["type"]) {
  const recentLikes = likes.filter((like) => like.fromUserId === fromUserId && Date.now() - new Date(like.createdAt).getTime() < 60 * 60 * 1000);
  if (recentLikes.length >= 12) throw new Error("Like limit reached. Slow down and review profiles more intentionally.");
  if (isLowEffortProfile(profileForUser(fromUserId))) throw new Error("Complete your profile before sending more likes.");
  const targetProfile = profileForUser(toUserId);
  const existing = likes.find((like) => like.fromUserId === fromUserId && like.toUserId === toUserId);
  if (!existing) likes.push({ id: nanoid(), fromUserId, toUserId, type, createdAt: new Date().toISOString() });
  if (targetProfile) recordBehavior(behaviorEvents, { userId: fromUserId, profileId: targetProfile.id, type: "like" });
  const reverse = likes.find((like) => like.fromUserId === toUserId && like.toUserId === fromUserId);
  if (!reverse) return { matched: false };
  let match = matches.find((item) => item.users.includes(fromUserId) && item.users.includes(toUserId));
  if (!match) {
    match = { id: `match-${nanoid(8)}`, users: [fromUserId, toUserId], createdAt: new Date().toISOString(), blocked: false };
    matches.push(match);
  }
  return { matched: true, match };
}

export function passProfile(fromUserId: string, toUserId: string) {
  const targetProfile = profileForUser(toUserId);
  if (targetProfile) recordBehavior(behaviorEvents, { userId: fromUserId, profileId: targetProfile.id, type: "pass" });
  passes.push({ id: nanoid(), fromUserId, toUserId, createdAt: new Date().toISOString() });
  return { ok: true };
}

export function undoLastPass(userId: string) {
  const index = [...passes].reverse().findIndex((pass) => pass.fromUserId === userId);
  if (index < 0) return null;
  const realIndex = passes.length - 1 - index;
  const [removed] = passes.splice(realIndex, 1);
  return removed;
}

export function getLikesReceived(userId: string) {
  return likes
    .filter((like) => like.toUserId === userId)
    .map((like) => ({ like, profile: profileForUser(like.fromUserId) }))
    .filter((item) => item.profile);
}

async function conversationMetrics(match: Match) {
  const metrics = analyzeConversation(match, messages);
  const fade = await getConversationFade(match, messages);
  return {
    ...metrics,
    fadePercentage: fade.fade_score,
    fadeStatus: fade.status,
    fadeExplanation: fade.explanation,
    fadeFactors: fade.factors,
    ghostingRisk: fade.fade_score / 100,
    status: fade.status === "fading" ? "fading" as const : metrics.status,
    nudge: fade.status === "active" ? "This conversation has a balanced rhythm." : fade.status === "slowing" ? "Conversation is slowing. A specific question can revive momentum." : "Conversation is fading. Consider a clear, low-pressure check-in."
  };
}

export async function getMatches(userId: string) {
  return Promise.all(matches
    .filter((match) => match.users.includes(userId) && !match.blocked)
    .map(async (match) => {
      const matchMessages = messages
        .filter((message) => message.matchId === match.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      return {
        match,
        profiles: match.users.filter((id) => id !== userId).map(profileForUser).filter(Boolean),
        metrics: await conversationMetrics(match),
        starters: generateConversationStarters(match, profiles, conversationStarters),
        lastMessage: matchMessages.at(-1),
        unreadCount: matchMessages.filter((message) => message.fromUserId !== userId && !message.readAt).length
      };
    }));
}

export function addMessage(matchId: string, fromUserId: string, body: string) {
  const match = matches.find((item) => item.id === matchId && item.users.includes(fromUserId) && !item.blocked);
  if (!match) throw new Error("Messaging unlocks only after a mutual match");
  if (body.trim().length < 8) throw new Error("Send a little more context to avoid low-effort openers.");
  if (isCopyPasteMessage(body, messages, fromUserId)) throw new Error("This looks copied from an earlier message. Try making it specific to this match.");
  const message: Message = { id: `msg-${nanoid(8)}`, matchId, fromUserId, body, createdAt: new Date().toISOString() };
  messages.push(message);
  const otherUserId = match.users.find((id) => id !== fromUserId);
  const otherProfile = otherUserId ? profileForUser(otherUserId) : null;
  if (otherProfile) recordBehavior(behaviorEvents, { userId: fromUserId, profileId: otherProfile.id, type: "message" });
  return message;
}

export async function messagesForMatch(matchId: string, userId: string) {
  return (await conversationForMatch(matchId, userId)).messages;
}

export async function conversationForMatch(matchId: string, userId: string) {
  const match = matches.find((item) => item.id === matchId && item.users.includes(userId));
  if (!match) throw new Error("Match not found");
  return {
    messages: messages.filter((message) => message.matchId === matchId).map((message) => ({ ...message, reactions: messageReactions.filter((reaction) => reaction.messageId === message.id) })),
    metrics: await conversationMetrics(match),
    starters: generateConversationStarters(match, profiles, conversationStarters),
    quality: matchQualityBreakdown(matchId, userId),
    profiles: match.users.filter((id) => id !== userId).map(profileForUser).filter(Boolean)
  };
}

export function addMessageReaction(messageId: string, userId: string, input: unknown) {
  const parsed = reactionSchema.parse(input);
  const message = messages.find((item) => item.id === messageId);
  if (!message) throw new Error("Message not found");
  const match = matches.find((item) => item.id === message.matchId && item.users.includes(userId));
  if (!match) throw new Error("Message not found");
  const existing = messageReactions.find((reaction) => reaction.messageId === messageId && reaction.userId === userId && reaction.emoji === parsed.emoji);
  if (existing) return existing;
  const reaction = { id: `reaction-${nanoid(8)}`, messageId, userId, emoji: parsed.emoji, createdAt: new Date().toISOString() };
  messageReactions.push(reaction);
  return reaction;
}

export function createReport(userId: string, reportedUserId: string, reason: string, details: string) {
  const report: Report = { id: `report-${nanoid(8)}`, reporterUserId: userId, reportedUserId, reason, details, status: "open", createdAt: new Date().toISOString() };
  reports.push(report);
  return report;
}

export function blockUser(blockerUserId: string, blockedUserId: string) {
  blocks.push({ id: `block-${nanoid(8)}`, blockerUserId, blockedUserId, createdAt: new Date().toISOString() });
  matches.forEach((match) => {
    if (match.users.includes(blockerUserId) && match.users.includes(blockedUserId)) match.blocked = true;
  });
  return { ok: true };
}

export function updateSettings(userId: string, input: Partial<Pick<User, "readReceipts" | "screenshotWarning"> & Pick<Profile, "hidden" | "paused">>) {
  const user = users.find((item) => item.id === userId) || demoUser;
  if (typeof input.readReceipts === "boolean") user.readReceipts = input.readReceipts;
  if (typeof input.screenshotWarning === "boolean") user.screenshotWarning = input.screenshotWarning;
  const profile = profileForUser(userId);
  if (profile) {
    if (typeof input.hidden === "boolean") profile.hidden = input.hidden;
    if (typeof input.paused === "boolean") profile.paused = input.paused;
  }
  return { user: publicUser(user), profile };
}

function buildDefaultSettings(userId: string): UserSettings {
  const user = users.find((item) => item.id === userId) || demoUser;
  const profile = profileForUser(userId);
  const discovery = discoveryPreferences[userId] || {
    ageRange: [25, 40],
    distanceKm: profile?.distancePreferenceKm || 40,
    intent: profile?.datingIntent || "open",
    showMe: "everyone",
    dealbreakers: profile?.dealbreakers || []
  };
  discoveryPreferences[userId] = discovery;
  return {
    userId,
    account: { email: user.email, emailVerified: user.emailVerified, deactivated: false },
    profile: { editProfileReminder: true, photosVisible: true, interestsVisible: true },
    discovery,
    privacy: {
      hideProfile: !!profile?.hidden,
      pauseDiscovery: !!profile?.paused,
      readReceipts: user.readReceipts,
      onlineStatus: true,
      screenshotWarning: user.screenshotWarning
    },
    notifications: { newMatches: true, messages: true, compliments: true, likes: true, safetyAlerts: true },
    safety: {
      blockedUsersCount: blocks.filter((block) => block.blockerUserId === userId).length,
      openReportsCount: reports.filter((report) => report.reporterUserId === userId && report.status !== "resolved").length,
      moderationStatus: "No active restrictions"
    },
    appearance: { mode: "dark", accentColor: "pink" }
  };
}

export function getSettings(userId: string) {
  userSettings[userId] ||= buildDefaultSettings(userId);
  return userSettings[userId];
}

export function patchSettings(userId: string, patch: Partial<UserSettings>) {
  const current = getSettings(userId);
  const next = {
    ...current,
    ...patch,
    account: { ...current.account, ...patch.account },
    profile: { ...current.profile, ...patch.profile },
    discovery: { ...current.discovery, ...patch.discovery },
    privacy: { ...current.privacy, ...patch.privacy },
    notifications: { ...current.notifications, ...patch.notifications },
    safety: { ...current.safety, ...patch.safety },
    appearance: { ...current.appearance, ...patch.appearance }
  };
  userSettings[userId] = next;
  const user = users.find((item) => item.id === userId);
  if (user) {
    user.readReceipts = next.privacy.readReceipts;
    user.screenshotWarning = next.privacy.screenshotWarning;
  }
  const profile = profileForUser(userId);
  if (profile) {
    profile.hidden = next.privacy.hideProfile;
    profile.paused = next.privacy.pauseDiscovery;
    profile.distancePreferenceKm = next.discovery.distanceKm;
    profile.dealbreakers = next.discovery.dealbreakers;
  }
  discoveryPreferences[userId] = next.discovery;
  return next;
}

export function addSeeMore(userId: string, profileId: string) {
  seeMore.push({ id: `seemore-${nanoid(8)}`, userId, profileId, createdAt: new Date().toISOString() });
}

export function moderationQueue() {
  return reports.map((report) => ({
    ...report,
    reporter: profileForUser(report.reporterUserId)?.displayName || "Unknown",
    reported: profileForUser(report.reportedUserId)?.displayName || "Unknown"
  }));
}

export function trustForUser(userId: string) {
  const user = users.find((item) => item.id === userId) || demoUser;
  return buildTrustScore(user, profileForUser(userId));
}

export function verifyPhoto(userId: string) {
  const profile = profileForUser(userId);
  if (profile) profile.photoVerified = true;
  return trustForUser(userId);
}

export function dashboardForUser(userId: string) {
  const userMatches = matches.filter((match) => match.users.includes(userId));
  const matchCount = userMatches.length;
  const sentLikes = likes.filter((like) => like.fromUserId === userId).length;
  const repliedMatches = userMatches.filter((match) => messages.some((message) => message.matchId === match.id && message.fromUserId !== userId)).length;
  const totalMessages = userMatches.flatMap((match) => messages.filter((message) => message.matchId === match.id));
  const traits = dynamicPreferenceWeights(userId, behaviorEvents, profiles).topTraits;
  return {
    matchSuccessRate: sentLikes ? Math.round((matchCount / sentLikes) * 100) : 0,
    replyRate: matchCount ? Math.round((repliedMatches / matchCount) * 100) : 0,
    averageConversationLength: matchCount ? Math.round(totalMessages.length / matchCount) : 0,
    topCompatibilityTraits: traits,
    adaptivePreferenceSummary: traits.map((trait) => `Your activity is increasing the importance of ${trait}.`),
    lowEffortWarnings: isLowEffortProfile(profileForUser(userId)) ? ["Your profile is being deprioritized until bio, interests, and prompts are more complete."] : []
  };
}

export function matchQualityBreakdown(matchId: string, userId: string): MatchQualityBreakdown {
  const match = matches.find((item) => item.id === matchId && item.users.includes(userId));
  if (!match) throw new Error("Match not found");
  const viewer = profileForUser(userId);
  const otherUserId = match.users.find((id) => id !== userId);
  const candidate = otherUserId ? profileForUser(otherUserId) : null;
  if (!viewer || !candidate) throw new Error("Match not found");
  const explanation = explainMatchV2(viewer, candidate, behaviorEvents, profiles, promptAnswers);
  const starters = generateConversationStarters(match, profiles, conversationStarters);
  const sharedValues = viewer.values.filter((value) => candidate.values.includes(value));
  return {
    matchId,
    compatibilityScore: explanation.score,
    confidenceScore: explanation.confidence,
    sharedInterests: explanation.sharedInterests,
    sharedValues,
    relationshipGoalAlignment: explanation.matchedGoals.length ? `You both named ${explanation.matchedGoals.map((goal) => goal.replaceAll("_", " ")).join(", ")}.` : "Your long-term goals need a little more conversation.",
    communicationCompatibility: explanation.categoryScores.communication > 0.7 ? "Your communication styles should feel natural together." : "Your communication styles differ, so direct expectations may help.",
    lifestyleRhythm: explanation.categoryScores.lifestyle > 0.6 ? "Your day-to-day rhythms have meaningful overlap." : "Your lifestyle rhythms differ in a way worth discussing early.",
    possibleFrictionPoints: explanation.possibleDifferences,
    recommendedConversationStarters: starters
  };
}

export function sendCompliment(fromUserId: string, input: unknown) {
  const parsed = complimentSchema.parse(input);
  const today = new Date().toISOString().slice(0, 10);
  const sentToday = compliments.filter((item) => item.fromUserId === fromUserId && item.createdAt.startsWith(today));
  if (sentToday.length >= 3) throw new Error("You can send three thoughtful compliments per day.");
  if (compliments.some((item) => item.fromUserId === fromUserId && item.toUserId === parsed.toUserId && item.body.toLowerCase() === parsed.body.toLowerCase())) {
    throw new Error("You already sent this compliment. Try making it more personal.");
  }
  const compliment = { id: `compliment-${nanoid(8)}`, fromUserId, toUserId: parsed.toUserId, category: parsed.category as ComplimentCategory, body: parsed.body, status: "sent" as const, createdAt: new Date().toISOString() };
  compliments.push(compliment);
  return compliment;
}

export function getCompliments(userId: string) {
  return compliments
    .filter((item) => item.fromUserId === userId || item.toUserId === userId)
    .map((item) => ({ ...item, fromProfile: profileForUser(item.fromUserId), toProfile: profileForUser(item.toUserId) }));
}

export function updateCompliment(userId: string, complimentId: string, status: "accepted" | "ignored" | "reported") {
  const compliment = compliments.find((item) => item.id === complimentId && item.toUserId === userId);
  if (!compliment) throw new Error("Compliment not found");
  compliment.status = status;
  if (status === "reported") createReport(userId, compliment.fromUserId, "Compliment concern", compliment.body);
  return compliment;
}
