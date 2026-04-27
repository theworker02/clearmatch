# Matching V2

ClearMatch V2 keeps the original weighted compatibility model and adds adaptive behavior signals.

## Behavior used

- Profile views.
- Time spent viewing profiles.
- Likes and passes.
- Message and reply behavior.
- Ghosting risk from conversation health.

The system stores behavior as private `UserBehavior` records. These records influence category weights but are not shown to other users.

## Adaptive scoring

The service in `services/matching-engine-v2` starts with the original categories, then adjusts weights using `services/behavior-tracking`.

If a user repeatedly views or likes profiles with a trait such as `hiking`, `early riser`, or `serious relationship`, that trait increases the relevant category weight. Passes and ghosting signals reduce momentum.

## Intent

Dating intent is treated as a high-signal category:

- Serious relationship.
- Casual dating.
- Just exploring.

Mismatched serious/casual intent receives a heavy penalty. Exploratory intent receives a smaller penalty because ambiguity is expected.

## Confidence

The compatibility confidence score is separate from match percent. It rises as the app has more behavioral evidence and more shared profile data. Low-effort profiles reduce confidence.

## Privacy

Adaptive explanations are phrased as personal recommendations, not surveillance. ClearMatch does not reveal another user's private activity.
