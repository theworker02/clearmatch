# UI System

ClearMatch Phase 3 uses a mobile-first dark interface designed to feel like a native dating app inside the browser.

## Color

- Background: `#0f172a`
- Surface: `#1e293b`
- Primary accent: `#ec4899`
- Secondary accent: `#3b82f6`
- Primary text: `#f8fafc`
- Secondary text: `#94a3b8`
- Borders: `rgba(255,255,255,0.08)`

## Elevation

- Level 1, base cards: `0 4px 12px rgba(0,0,0,0.25)`
- Level 2, hover and focus: `0 8px 24px rgba(0,0,0,0.35)`
- Level 3, floating elements and modals: `0 16px 40px rgba(0,0,0,0.45)`

## Layout

- App content is centered at a mobile product width of `480px`.
- Main content uses a consistent 4/8/12/16/24/32 spacing rhythm.
- Mobile navigation uses a four-tab bottom bar: Discover, Matches, Messages, Profile.

## Components

Reusable component helpers live in:

- `frontend/src/components/ui/Button.ts`
- `frontend/src/components/ui/Card.ts`
- `frontend/src/components/ui/Input.ts`
- `frontend/src/components/ui/Modal.ts`
- `frontend/src/components/layout/Navbar.ts`
- `frontend/src/components/layout/ScreenContainer.ts`
