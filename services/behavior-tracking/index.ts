import type { Profile, UserBehavior } from "../../shared/types";

const behaviorWeight = {
  view: 0.2,
  like: 1,
  pass: -0.35,
  message: 0.65,
  reply: 0.8,
  ghost: -0.7
};

export function recordBehavior(events: UserBehavior[], event: Omit<UserBehavior, "id" | "createdAt">) {
  const item: UserBehavior = {
    ...event,
    id: `behavior-${events.length + 1}-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  events.push(item);
  return item;
}

export function dynamicPreferenceWeights(userId: string, events: UserBehavior[], profiles: Profile[]) {
  const traits = new Map<string, number>();
  const categoryMomentum = {
    interests: 0,
    lifestyle: 0,
      values: 0,
      communication: 0,
      intent: 0,
      conversationPotential: 0,
      relationshipReadiness: 0,
      weekendRhythm: 0
  };

  events
    .filter((event) => event.userId === userId)
    .forEach((event) => {
      const profile = profiles.find((item) => item.id === event.profileId || item.userId === event.profileId);
      if (!profile) return;
      const score = behaviorWeight[event.type] + Math.min((event.durationMs || 0) / 90000, 0.4);
      profile.interests.forEach((trait) => traits.set(`interest:${trait}`, (traits.get(`interest:${trait}`) || 0) + score));
      profile.lifestyle.forEach((trait) => traits.set(`lifestyle:${trait}`, (traits.get(`lifestyle:${trait}`) || 0) + score * 0.8));
      profile.values.forEach((trait) => traits.set(`value:${trait}`, (traits.get(`value:${trait}`) || 0) + score * 0.7));
      traits.set(`communication:${profile.communicationStyle}`, (traits.get(`communication:${profile.communicationStyle}`) || 0) + score * 0.6);
      traits.set(`intent:${profile.datingIntent}`, (traits.get(`intent:${profile.datingIntent}`) || 0) + score);
      if (profile.prompts.some((prompt) => prompt.answer.trim().split(/\s+/).length >= 14)) {
        traits.set("signal:thoughtful prompts", (traits.get("signal:thoughtful prompts") || 0) + score * 0.55);
        categoryMomentum.conversationPotential += score * 0.5;
      }
      if (profile.relationshipGoals.some((goal) => ["life_partner", "long_term"].includes(goal)) && profile.datingIntent === "serious_relationship") {
        traits.set("signal:relationship readiness", (traits.get("signal:relationship readiness") || 0) + score * 0.7);
        categoryMomentum.relationshipReadiness += score * 0.6;
      }
      if (profile.lifestyle.some((trait) => /weekend|early|routine|active|home|city/i.test(trait))) {
        categoryMomentum.weekendRhythm += score * 0.45;
      }
    });

  for (const [trait, score] of traits) {
    if (trait.startsWith("interest:")) categoryMomentum.interests += score;
    if (trait.startsWith("lifestyle:")) categoryMomentum.lifestyle += score;
    if (trait.startsWith("value:")) categoryMomentum.values += score;
    if (trait.startsWith("communication:")) categoryMomentum.communication += score;
    if (trait.startsWith("intent:")) categoryMomentum.intent += score;
    if (trait.startsWith("signal:thoughtful")) categoryMomentum.conversationPotential += score;
    if (trait.startsWith("signal:relationship")) categoryMomentum.relationshipReadiness += score;
  }

  const boost = (value: number) => Math.max(-4, Math.min(8, Math.round(value)));
  return {
    weights: {
      interests: 20 + boost(categoryMomentum.interests),
      responseTime: 15,
      goals: 20,
      lifestyle: 15 + boost(categoryMomentum.lifestyle),
      communication: 15 + boost(categoryMomentum.communication),
      distance: 15,
      values: 15 + boost(categoryMomentum.values),
      intent: 24 + boost(categoryMomentum.intent),
      promptDepth: 8,
      bioEffort: 6,
      weekendRhythm: 7 + boost(categoryMomentum.weekendRhythm),
      relationshipReadiness: 10 + boost(categoryMomentum.relationshipReadiness),
      conversationPotential: 8 + boost(categoryMomentum.conversationPotential),
      valueTone: 7,
      ageStage: 6,
      personalityTest: 14
    },
    topTraits: [...traits.entries()]
      .filter(([, value]) => value > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([key]) => key.replace("interest:", "").replace("lifestyle:", "").replace("value:", "").replace("communication:", "").replace("intent:", "").replace("signal:", "").replaceAll("_", " "))
  };
}
