# Trust System

The trust system is implemented in `services/trust-system`.

## Signals

- Email verification, required for production matching.
- Optional photo verification UI flow.
- Profile completeness score.
- Low-effort profile detection.

## Profile completeness

Completeness is calculated from profile fields such as bio length, photos, interests, values, lifestyle details, prompt quality, and dating intent.

## Low-effort detection

Profiles are considered low effort when they have empty or very short bios, too few interests, or shallow prompt answers. Low-effort profiles can be blocked from sending likes and deprioritized in discovery.

## Badges

Badges are intentionally minimal:

- Email verified.
- Photo verified.
- Complete profile.
- Thoughtful profile.

No public popularity or social proof badges are used.

## Privacy

Trust signals are limited to authenticity and profile quality. ClearMatch does not use follower counts, public activity, mutual friends, or social media links.
