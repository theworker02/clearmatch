export type RelationshipGoal = "life_partner" | "long_term" | "intentional_dating" | "friendship_first";
export type DatingIntent = "serious_relationship" | "casual_dating" | "just_exploring";
export type CommunicationStyle = "steady" | "expressive" | "direct" | "playful" | "reflective";
export type ResponseTime = "minutes" | "hours" | "daily" | "few_days";
export type PromptQuestionType = "short_answer" | "multiple_choice" | "slider" | "yes_no" | "ranked_preference";
export type PromptCategory = "personality" | "dating_intentions" | "communication" | "lifestyle" | "values";
export type ComplimentCategory = "profile_answer" | "photo" | "shared_interest" | "personality";

export interface PersonalityAnswer {
  key: string;
  label: string;
  value: number;
}

export interface Profile {
  id: string;
  userId: string;
  displayName: string;
  age: number;
  city: string;
  latitude: number;
  longitude: number;
  bio: string;
  photos: string[];
  interests: string[];
  relationshipGoals: RelationshipGoal[];
  datingIntent: DatingIntent;
  lifestyle: string[];
  values: string[];
  communicationStyle: CommunicationStyle;
  likelyResponseTime: ResponseTime;
  distancePreferenceKm: number;
  dealbreakers: string[];
  prompts: { question: string; answer: string }[];
  hidden: boolean;
  paused: boolean;
  photoVerified?: boolean;
  personalityType?: string;
  personalitySummary?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash?: string;
  emailVerified: boolean;
  readReceipts: boolean;
  screenshotWarning: boolean;
  createdAt: string;
}

export interface Like {
  id: string;
  fromUserId: string;
  toUserId: string;
  type: "like" | "super_like";
  createdAt: string;
}

export interface Pass {
  id: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
}

export interface Match {
  id: string;
  users: string[];
  createdAt: string;
  blocked: boolean;
}

export interface Message {
  id: string;
  matchId: string;
  fromUserId: string;
  body: string;
  createdAt: string;
  readAt?: string;
  replyToMessageId?: string;
  reactions?: MessageReaction[];
}

export interface Report {
  id: string;
  reporterUserId: string;
  reportedUserId: string;
  reason: string;
  details: string;
  status: "open" | "reviewing" | "resolved";
  createdAt: string;
}

export interface Block {
  id: string;
  blockerUserId: string;
  blockedUserId: string;
  createdAt: string;
}

export interface SeeMore {
  id: string;
  userId: string;
  profileId: string;
  createdAt: string;
}

export interface MatchExplanation {
  score: number;
  confidence: number;
  sharedInterests: string[];
  matchedGoals: RelationshipGoal[];
  possibleDifferences: string[];
  reasons: string[];
  adaptiveReasons: string[];
  hiddenSignals: string[];
  categoryScores: Record<string, number>;
  dynamicWeights: Record<string, number>;
  dealbreakerPenalty: number;
  lowEffortPenalty: number;
  intentPenalty: number;
}

export interface UserBehavior {
  id: string;
  userId: string;
  profileId: string;
  type: "view" | "like" | "pass" | "message" | "reply" | "ghost";
  durationMs?: number;
  createdAt: string;
}

export interface MatchInteraction {
  id: string;
  matchId: string;
  userId: string;
  type: "starter_used" | "nudge_sent" | "conversation_recovered" | "conversation_faded";
  createdAt: string;
}

export interface ConversationMetrics {
  matchId: string;
  messageCount: number;
  averageMessageLength: number;
  balanceScore: number;
  averageResponseMinutes: number;
  replyRate: number;
  ghostingRisk: number;
  fadePercentage?: number;
  fadeStatus?: "active" | "slowing" | "fading";
  fadeExplanation?: string;
  fadeFactors?: Record<string, number | boolean>;
  status: "healthy" | "fading" | "one_sided" | "dead";
  nudge: string;
}

export interface TrustScore {
  userId: string;
  emailVerified: boolean;
  photoVerified: boolean;
  profileCompleteness: number;
  lowEffort: boolean;
  score: number;
  badges: string[];
  reasons: string[];
}

export interface ConversationStarter {
  id: string;
  matchId: string;
  text: string;
  source: "shared_interest" | "prompt_bridge" | "personality_value";
  createdAt: string;
}

export interface MatchQualityDashboard {
  matchSuccessRate: number;
  replyRate: number;
  averageConversationLength: number;
  topCompatibilityTraits: string[];
  adaptivePreferenceSummary: string[];
  lowEffortWarnings: string[];
}

export interface PromptQuestion {
  id: string;
  category: PromptCategory;
  type: PromptQuestionType;
  question: string;
  options?: string[];
  minLabel?: string;
  maxLabel?: string;
}

export interface PromptAnswer {
  id: string;
  userId: string;
  questionId: string;
  value: string | number | boolean | string[];
  createdAt: string;
}

export interface Compliment {
  id: string;
  fromUserId: string;
  toUserId: string;
  category: ComplimentCategory;
  body: string;
  status: "sent" | "accepted" | "ignored" | "reported";
  createdAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface UserSettings {
  userId: string;
  account: {
    email: string;
    emailVerified: boolean;
    deactivated: boolean;
  };
  profile: {
    editProfileReminder: boolean;
    photosVisible: boolean;
    interestsVisible: boolean;
  };
  discovery: DiscoveryPreferences;
  privacy: {
    hideProfile: boolean;
    pauseDiscovery: boolean;
    readReceipts: boolean;
    onlineStatus: boolean;
    screenshotWarning: boolean;
  };
  notifications: {
    newMatches: boolean;
    messages: boolean;
    compliments: boolean;
    likes: boolean;
    safetyAlerts: boolean;
  };
  safety: {
    blockedUsersCount: number;
    openReportsCount: number;
    moderationStatus: string;
  };
  appearance: {
    mode: "dark" | "light" | "system";
    accentColor: "pink" | "blue" | "violet";
  };
}

export interface DiscoveryPreferences {
  ageRange: [number, number];
  distanceKm: number;
  intent: DatingIntent | "open";
  showMe: "everyone" | "women" | "men" | "nonbinary";
  dealbreakers: string[];
}

export interface MatchQualityBreakdown {
  matchId: string;
  compatibilityScore: number;
  confidenceScore: number;
  sharedInterests: string[];
  sharedValues: string[];
  relationshipGoalAlignment: string;
  communicationCompatibility: string;
  lifestyleRhythm: string;
  possibleFrictionPoints: string[];
  recommendedConversationStarters: ConversationStarter[];
}
