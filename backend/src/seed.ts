import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import type { Block, Compliment, ConversationStarter, DiscoveryPreferences, Like, Match, MatchInteraction, Message, MessageReaction, Pass, Profile, PromptAnswer, PromptQuestion, Report, SeeMore, TrustScore, User, UserBehavior, UserSettings } from "../../shared/types";

const now = new Date().toISOString();

export const demoUser: User = {
  id: "user-demo",
  email: "demo@clearmatch.app",
  passwordHash: bcrypt.hashSync("ClearMatch123!", 10),
  emailVerified: true,
  readReceipts: true,
  screenshotWarning: true,
  createdAt: now
};

export const profiles: Profile[] = [
  {
    id: "profile-demo",
    userId: "user-demo",
    displayName: "Maya",
    age: 31,
    city: "Brooklyn, NY",
    latitude: 40.6782,
    longitude: -73.9442,
    bio: "Product designer, weekend baker, looking for something intentional and low-drama.",
    photos: ["/avatars/maya.svg"],
    interests: ["coffee walks", "live jazz", "design", "farmers markets", "cooking"],
    relationshipGoals: ["long_term", "life_partner"],
    datingIntent: "serious_relationship",
    lifestyle: ["early riser", "active", "dog friendly", "city weekends"],
    values: ["kindness", "curiosity", "privacy", "emotional maturity"],
    communicationStyle: "steady",
    likelyResponseTime: "hours",
    distancePreferenceKm: 40,
    dealbreakers: ["casual_only", "smoking"],
    prompts: [
      { question: "A perfect slow Sunday", answer: "A long walk, a tiny bookstore, and cooking dinner for two." },
      { question: "I feel cared for when", answer: "Someone remembers the little things without making a production of it." }
    ],
    hidden: false,
    paused: false,
    photoVerified: true,
    personalityType: "Grounded Connector",
    personalitySummary: "Steady, clear, and most comfortable when interest feels consistent."
  },
  {
    id: "profile-noah",
    userId: "user-noah",
    displayName: "Noah",
    age: 33,
    city: "Jersey City, NJ",
    latitude: 40.7178,
    longitude: -74.0431,
    bio: "Urban planner, calm communicator, big fan of unhurried dates and clear intentions.",
    photos: ["/avatars/noah.svg"],
    interests: ["coffee walks", "architecture", "live jazz", "cycling", "cooking"],
    relationshipGoals: ["long_term", "life_partner"],
    datingIntent: "serious_relationship",
    lifestyle: ["active", "early riser", "city weekends", "dog friendly"],
    values: ["kindness", "privacy", "community", "emotional maturity"],
    communicationStyle: "steady",
    likelyResponseTime: "hours",
    distancePreferenceKm: 35,
    dealbreakers: ["casual_only"],
    prompts: [
      { question: "Green flag I notice", answer: "You can talk through awkward things with warmth." },
      { question: "Best date format", answer: "Coffee, a neighborhood walk, then deciding if we want dinner." }
    ],
    hidden: false,
    paused: false,
    photoVerified: true,
    personalityType: "Grounded Connector",
    personalitySummary: "Steady, clear, and most comfortable when interest feels consistent."
  },
  {
    id: "profile-eli",
    userId: "user-eli",
    displayName: "Eli",
    age: 29,
    city: "Queens, NY",
    latitude: 40.7282,
    longitude: -73.7949,
    bio: "Teacher, climber, and chronic playlist maker. Serious about kindness, unserious about karaoke.",
    photos: ["/avatars/eli.svg"],
    interests: ["rock climbing", "karaoke", "teaching", "coffee walks", "indie films"],
    relationshipGoals: ["intentional_dating", "long_term"],
    datingIntent: "just_exploring",
    lifestyle: ["active", "night owl", "budget conscious", "city weekends"],
    values: ["humor", "kindness", "growth", "family"],
    communicationStyle: "playful",
    likelyResponseTime: "daily",
    distancePreferenceKm: 25,
    dealbreakers: ["wants_kids_now"],
    prompts: [
      { question: "Two truths and a lie energy", answer: "I will absolutely make us a shared playlist." },
      { question: "My friends ask me for", answer: "The pep talk before a big conversation." }
    ],
    hidden: false,
    paused: false,
    photoVerified: false,
    personalityType: "Playful Catalyst",
    personalitySummary: "Lighthearted, socially warm, and energized by humor and shared momentum."
  },
  {
    id: "profile-samira",
    userId: "user-samira",
    displayName: "Samira",
    age: 35,
    city: "Hoboken, NJ",
    latitude: 40.7433,
    longitude: -74.0324,
    bio: "Nurse practitioner, dinner party optimist, looking for steady partnership and shared rituals.",
    photos: ["/avatars/samira.svg"],
    interests: ["farmers markets", "cooking", "yoga", "live jazz", "volunteering"],
    relationshipGoals: ["life_partner", "long_term"],
    datingIntent: "serious_relationship",
    lifestyle: ["early riser", "active", "family oriented", "city weekends"],
    values: ["service", "kindness", "family", "emotional maturity"],
    communicationStyle: "direct",
    likelyResponseTime: "hours",
    distancePreferenceKm: 45,
    dealbreakers: ["casual_only", "does_not_want_kids"],
    prompts: [
      { question: "I am happiest when", answer: "The table is full and nobody is rushing." },
      { question: "A boundary I appreciate", answer: "Clear plans and no guessing games." }
    ],
    hidden: false,
    paused: false,
    photoVerified: true,
    personalityType: "Intentional Builder",
    personalitySummary: "Relationship-minded, future-aware, and focused on healthy partnership."
  }
];

export const users: User[] = [
  demoUser,
  ...profiles
    .filter((profile) => profile.userId !== demoUser.id)
    .map((profile) => ({
      id: profile.userId,
      email: `${profile.displayName.toLowerCase()}@example.com`,
      passwordHash: bcrypt.hashSync("ClearMatch123!", 10),
      emailVerified: true,
      readReceipts: true,
      screenshotWarning: true,
      createdAt: now
    }))
];

export const likes: Like[] = [
  { id: nanoid(), fromUserId: "user-noah", toUserId: demoUser.id, type: "super_like", createdAt: now },
  { id: nanoid(), fromUserId: "user-samira", toUserId: demoUser.id, type: "like", createdAt: now }
];

export const passes: Pass[] = [];
export const matches: Match[] = [];
export const messages: Message[] = [];
export const reports: Report[] = [];
export const blocks: Block[] = [];
export const seeMore: SeeMore[] = [];
export const promptQuestions: PromptQuestion[] = [
  { id: "personality-understood", category: "personality", type: "short_answer", question: "What usually makes you feel most understood by someone?" },
  { id: "personality-energy", category: "personality", type: "multiple_choice", question: "Are you more energized by quiet nights or spontaneous plans?", options: ["Quiet nights", "Spontaneous plans", "A balanced mix"] },
  { id: "personality-humor", category: "personality", type: "multiple_choice", question: "What kind of humor do you connect with most?", options: ["Dry and clever", "Playful and silly", "Warm storytelling", "A little sarcastic"] },
  { id: "personality-recharge", category: "personality", type: "multiple_choice", question: "After a draining week, what helps you feel like yourself again?", options: ["Quiet time alone", "Being around favorite people", "Getting outside", "Doing something creative"] },
  { id: "personality-pressure", category: "personality", type: "multiple_choice", question: "When life gets stressful, what do you usually need from someone you are dating?", options: ["Calm reassurance", "Practical help", "Space to think", "A little humor"] },
  { id: "personality-affection", category: "personality", type: "multiple_choice", question: "What kind of affection feels most natural to you?", options: ["Words and reassurance", "Quality time", "Small helpful actions", "Playful touch and warmth"] },
  { id: "personality-curiosity", category: "personality", type: "slider", question: "How much do you enjoy trying unfamiliar things with someone new?", minLabel: "I like familiar", maxLabel: "I love discovery" },
  { id: "intent-now", category: "dating_intentions", type: "multiple_choice", question: "What are you hoping dating leads to right now?", options: ["A serious relationship", "Intentional dating", "Something casual", "I am still exploring"] },
  { id: "intent-meet", category: "dating_intentions", type: "short_answer", question: "What makes you feel ready to meet someone in person?" },
  { id: "intent-healthy", category: "dating_intentions", type: "short_answer", question: "What does a healthy relationship look like to you?" },
  { id: "intent-pace", category: "dating_intentions", type: "multiple_choice", question: "What dating pace feels best to you when there is real interest?", options: ["Slow and steady", "Clear momentum", "Flexible and low-pressure", "I prefer to decide in person"] },
  { id: "intent-exclusivity", category: "dating_intentions", type: "slider", question: "How important is clarity around exclusivity once feelings develop?", minLabel: "Flexible", maxLabel: "Very important" },
  { id: "intent-future-talk", category: "dating_intentions", type: "multiple_choice", question: "When do you like talking about long-term goals?", options: ["Early, so expectations are clear", "After trust starts forming", "Only once things feel serious", "I prefer it to come up naturally"] },
  { id: "intent-dating-energy", category: "dating_intentions", type: "multiple_choice", question: "What kind of dating energy are you trying to avoid?", options: ["Mixed signals", "Pressure to rush", "Endless texting with no plans", "Overly casual effort"] },
  { id: "communication-interest", category: "communication", type: "multiple_choice", question: "How do you usually show interest in someone?", options: ["Consistent messages", "Thoughtful questions", "Making plans", "Small acts of care"] },
  { id: "communication-conflict", category: "communication", type: "multiple_choice", question: "How do you prefer someone handles conflict with you?", options: ["Talk it through directly", "Take a pause first", "Write it out", "Keep it gentle and practical"] },
  { id: "communication-easy", category: "communication", type: "short_answer", question: "What makes a conversation feel easy for you?" },
  { id: "communication-daily", category: "communication", type: "slider", question: "How important is daily communication to you?", minLabel: "Flexible", maxLabel: "Very important" },
  { id: "communication-repair", category: "communication", type: "multiple_choice", question: "After a misunderstanding, what helps you reconnect?", options: ["A direct apology", "A calm conversation", "A little time first", "A reassuring gesture"] },
  { id: "communication-texting", category: "communication", type: "multiple_choice", question: "What texting rhythm feels most respectful to you?", options: ["A few thoughtful check-ins", "Frequent short messages", "Flexible, no pressure", "Mostly for making plans"] },
  { id: "communication-vulnerability", category: "communication", type: "slider", question: "How comfortable are you opening up emotionally early on?", minLabel: "Slowly", maxLabel: "Pretty open" },
  { id: "lifestyle-weekend", category: "lifestyle", type: "short_answer", question: "What does your ideal weekend usually look like?" },
  { id: "lifestyle-routine", category: "lifestyle", type: "multiple_choice", question: "Are you more routine-focused or go-with-the-flow?", options: ["Routine-focused", "Go-with-the-flow", "Depends on the week"] },
  { id: "lifestyle-habits", category: "lifestyle", type: "ranked_preference", question: "Rank what matters most in day-to-day compatibility.", options: ["Reliability", "Humor", "Ambition", "Emotional maturity", "Shared interests"] },
  { id: "lifestyle-social-rhythm", category: "lifestyle", type: "multiple_choice", question: "What social rhythm fits your life best right now?", options: ["Mostly quiet and close-knit", "A balanced mix", "Social and active", "It changes week to week"] },
  { id: "lifestyle-adventure", category: "lifestyle", type: "slider", question: "How important is shared adventure or novelty in dating?", minLabel: "Not central", maxLabel: "Very important" },
  { id: "lifestyle-home-space", category: "lifestyle", type: "multiple_choice", question: "What makes shared downtime feel good to you?", options: ["Quiet comfort", "Cooking or nesting", "Watching something together", "Parallel time with no pressure"] },
  { id: "lifestyle-money-time", category: "lifestyle", type: "multiple_choice", question: "Which practical rhythm matters most in a partner?", options: ["Reliable planning", "Financial thoughtfulness", "Work-life balance", "Flexibility with schedules"] },
  { id: "values-care", category: "values", type: "short_answer", question: "What do you care about more than most people realize?" },
  { id: "values-compromise", category: "values", type: "short_answer", question: "What is something you refuse to compromise on?" },
  { id: "values-respect", category: "values", type: "short_answer", question: "What makes you feel respected in a relationship?" },
  { id: "values-loyalty", category: "values", type: "ranked_preference", question: "Rank what matters most: loyalty, humor, ambition, emotional maturity, shared interests.", options: ["Loyalty", "Humor", "Ambition", "Emotional maturity", "Shared interests"] },
  { id: "values-ambition-balance", category: "values", type: "multiple_choice", question: "How do you think about ambition in a relationship?", options: ["Growth matters a lot", "Balance matters more than status", "I admire steady purpose", "I care more about presence"] },
  { id: "values-family-community", category: "values", type: "multiple_choice", question: "What role should family or community play in your dating life?", options: ["Very important", "Important but bounded", "Not central", "Depends on the relationship"] },
  { id: "values-boundaries", category: "values", type: "yes_no", question: "Do clear boundaries make you feel more secure in dating?" }
];
export const personalityResults: Record<string, { type: string; summary: string }> = {
  "user-demo": { type: "Grounded Connector", summary: "Steady, clear, and most comfortable when interest feels consistent." },
  "user-noah": { type: "Grounded Connector", summary: "Steady, clear, and most comfortable when interest feels consistent." },
  "user-eli": { type: "Playful Catalyst", summary: "Lighthearted, socially warm, and energized by humor and shared momentum." },
  "user-samira": { type: "Intentional Builder", summary: "Relationship-minded, future-aware, and focused on healthy partnership." }
};
export const promptAnswers: PromptAnswer[] = [
  { id: nanoid(), userId: "user-demo", questionId: "personality-understood", value: "Someone notices what I mean without making me perform for attention.", createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "personality-energy", value: "Quiet nights", createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "personality-humor", value: "Warm storytelling", createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "intent-now", value: "A serious relationship", createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "communication-conflict", value: "Talk it through directly", createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "communication-daily", value: 7, createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "lifestyle-weekend", value: "A walk, a good meal, and enough quiet to reset.", createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "lifestyle-routine", value: "Routine-focused", createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "values-care", value: "Emotional maturity, privacy, and people doing what they said they would do.", createdAt: now },
  { id: nanoid(), userId: "user-demo", questionId: "values-loyalty", value: ["Emotional maturity", "Loyalty", "Humor"], createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "personality-understood", value: "I feel understood when someone listens closely and follows through later.", createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "personality-energy", value: "Quiet nights", createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "personality-humor", value: "Warm storytelling", createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "intent-now", value: "A serious relationship", createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "communication-conflict", value: "Talk it through directly", createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "communication-daily", value: 7, createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "lifestyle-weekend", value: "Coffee, a long neighborhood walk, and cooking without rushing.", createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "lifestyle-routine", value: "Routine-focused", createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "values-care", value: "Kindness, privacy, community, and steady effort.", createdAt: now },
  { id: nanoid(), userId: "user-noah", questionId: "values-loyalty", value: ["Emotional maturity", "Loyalty", "Shared interests"], createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "personality-understood", value: "When someone laughs with me but can still be sincere when it matters.", createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "personality-energy", value: "Spontaneous plans", createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "personality-humor", value: "Playful and silly", createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "intent-now", value: "I am still exploring", createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "communication-conflict", value: "Keep it gentle and practical", createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "communication-daily", value: 4, createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "lifestyle-weekend", value: "Climbing, friends, music, and probably one too-late night.", createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "lifestyle-routine", value: "Go-with-the-flow", createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "values-care", value: "Humor, growth, and people being kind when plans change.", createdAt: now },
  { id: nanoid(), userId: "user-eli", questionId: "values-loyalty", value: ["Humor", "Shared interests", "Emotional maturity"], createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "personality-understood", value: "Consistency, kindness, and someone noticing when I need a softer day.", createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "personality-energy", value: "A balanced mix", createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "personality-humor", value: "Warm storytelling", createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "intent-now", value: "A serious relationship", createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "communication-conflict", value: "Talk it through directly", createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "communication-daily", value: 8, createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "lifestyle-weekend", value: "Family, cooking, yoga, and a dinner table that lasts a while.", createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "lifestyle-routine", value: "Routine-focused", createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "values-care", value: "Service, family, emotional maturity, and clear plans.", createdAt: now },
  { id: nanoid(), userId: "user-samira", questionId: "values-loyalty", value: ["Loyalty", "Emotional maturity", "Ambition"], createdAt: now }
];
export const compliments: Compliment[] = [
  { id: nanoid(), fromUserId: "user-noah", toUserId: "user-demo", category: "profile_answer", body: "I liked your answer about slow Sundays. It felt calm and genuinely thoughtful.", status: "sent", createdAt: now }
];
export const messageReactions: MessageReaction[] = [];
export const discoveryPreferences: Record<string, DiscoveryPreferences> = {
  "user-demo": { ageRange: [27, 38], distanceKm: 40, intent: "serious_relationship", showMe: "everyone", dealbreakers: ["casual_only", "smoking"] }
};
export const userSettings: Record<string, UserSettings> = {};
export const behaviorEvents: UserBehavior[] = [
  { id: nanoid(), userId: "user-demo", profileId: "profile-noah", type: "view", durationMs: 78000, createdAt: now },
  { id: nanoid(), userId: "user-demo", profileId: "profile-noah", type: "like", createdAt: now },
  { id: nanoid(), userId: "user-demo", profileId: "profile-samira", type: "view", durationMs: 52000, createdAt: now }
];
export const matchInteractions: MatchInteraction[] = [];
export const trustScores: TrustScore[] = [];
export const conversationStarters: ConversationStarter[] = [];
