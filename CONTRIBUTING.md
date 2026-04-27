# Contributing

ClearMatch is organized as a compact full-stack TypeScript app.

## Development standards

- Keep frontend UI mobile-first and accessible.
- Use plain CSS or CSS modules, not Tailwind.
- Keep matching changes in `shared/matching.ts` so frontend and backend explanations stay aligned.
- Preserve privacy rules: no feeds, followers, public comments, reposting, mutual-friend surfacing, or social-media dependency.
- Add API documentation when changing routes.

## Checks

Run before opening a pull request:

```bash
npm run build
```
