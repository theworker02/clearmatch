import type { Profile, TrustScore, User } from "../../shared/types";

export function profileCompleteness(profile: Profile | null) {
  if (!profile) return 0;
  const checks = [
    profile.displayName.length >= 2,
    profile.age >= 18,
    profile.bio.trim().length >= 60,
    profile.photos.length > 0,
    profile.interests.length >= 4,
    profile.relationshipGoals.length > 0,
    profile.lifestyle.length >= 3,
    profile.values.length >= 3,
    profile.prompts.length >= 1 && profile.prompts.some((prompt) => prompt.answer.length >= 30),
    profile.datingIntent.length > 0
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function isLowEffortProfile(profile: Profile | null) {
  if (!profile) return true;
  return profile.bio.trim().length < 45 || profile.interests.length < 3 || profile.prompts.every((prompt) => prompt.answer.trim().length < 24);
}

export function buildTrustScore(user: User, profile: Profile | null): TrustScore {
  const completeness = profileCompleteness(profile);
  const lowEffort = isLowEffortProfile(profile);
  const photoVerified = !!profile?.photoVerified;
  const score = Math.max(0, Math.min(100, Math.round((user.emailVerified ? 30 : 0) + (photoVerified ? 25 : 0) + completeness * 0.45 - (lowEffort ? 18 : 0))));
  const badges = [
    user.emailVerified ? "Email verified" : "",
    photoVerified ? "Photo verified" : "",
    completeness >= 85 ? "Complete profile" : "",
    !lowEffort ? "Thoughtful profile" : ""
  ].filter(Boolean);
  const reasons = [
    user.emailVerified ? "Email is verified." : "Email verification is required before production matching.",
    photoVerified ? "Optional photo verification is complete." : "Photo verification is available but not complete.",
    `Profile completeness is ${completeness}%.`,
    lowEffort ? "Profile needs more detail before it should rank highly." : "Profile has enough detail for meaningful recommendations."
  ];
  return { userId: user.id, emailVerified: user.emailVerified, photoVerified, profileCompleteness: completeness, lowEffort, score, badges, reasons };
}
