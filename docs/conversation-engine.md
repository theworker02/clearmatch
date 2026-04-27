# Conversation Engine

The conversation engine is implemented in `services/conversation-analysis`.

## Deterministic starters

Conversation starters are generated from:

- Shared interests.
- Shared values.
- Profile prompt bridges.

No external AI service is required. Starters are deterministic, stored, and reused per match.

## Conversation health

The system measures:

- Message count.
- Average message length.
- Back-and-forth balance.
- Average response minutes.
- Reply rate.
- Ghosting risk.

Statuses:

- Healthy.
- Fading.
- One-sided.
- Dead.

## Nudges

Nudges are optional and lightweight, such as “Want to keep this going with a simple question?” They are designed to support better conversations without creating pressure or public shame.

## Anti-spam

The message service rejects very short low-effort openers and messages that are highly similar to a user's prior messages.
