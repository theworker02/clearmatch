# Matching Algorithm

ClearMatch uses weighted compatibility scoring from `shared/matching.ts`.

## Weighted categories

- Interests match: 20
- Likely response time: 15
- Relationship goals: 20
- Lifestyle compatibility: 15
- Communication style: 15
- Location and distance: 15
- Values and personality: 15
- Prompt depth: 8
- Profile effort: 6
- Weekend rhythm: 7
- Relationship readiness: 10
- Conversation potential: 8
- Value tone: 7
- Age and life-stage fit: 6
- Personality test alignment: 14

The weights normalize to a 0-100 score. Phase 2 adaptive behavior can nudge several weights up or down based on likes, passes, views, and message behavior.

## Category behavior

- Interests, goals, lifestyle, and values use overlap ratio.
- Response time scores nearby communication cadences higher.
- Communication style gives full credit for exact matches, partial credit for compatible neighboring styles, and lower credit for mismatches.
- Distance uses the stricter of both users' distance preferences.
- Prompt depth rewards thoughtful profile answers that give the matcher more context.
- Profile effort considers bio depth so sparse profiles are less over-promoted.
- Weekend rhythm looks at lifestyle clues such as early riser, active, homebody, routine, and city weekends.
- Relationship readiness blends relationship goals, stated intent, and relationship-oriented prompt language.
- Conversation potential combines shared interests with prompt depth and question-friendly answers.
- Value tone compares emotionally meaningful values such as kindness, privacy, growth, family, humor, and emotional maturity.
- Age and life-stage fit softly scores age gaps without acting as a hard filter.
- Personality test alignment compares the 35-question first-run assessment question-by-question across multiple choice, slider, ranked, yes/no, and short-answer formats. Missing test data stays neutral instead of punishing a new account.
- Personality type badges are derived locally from answer patterns and shown on profiles, for example Grounded Connector, Warm Communicator, Curious Explorer, Intentional Builder, Reflective Romantic, or Playful Catalyst.
- Dealbreaker conflicts subtract up to 35 points and can significantly demote a profile.

## Explanation output

Every suggested profile includes:

- Compatibility score.
- Shared interests.
- Matched relationship goals.
- Possible differences.
- Human-readable recommendation reasons.
- Raw category scores for debugging and future tuning.
