# Contributing

## Local setup

This project targets Node 20+ and modern React tooling.

```bash
npm install
npm run validate
```

## Key commands

- `npm run dev`: watch the library build with `tsup`
- `npm run build`: create ESM/CJS bundles and declarations in `dist/`
- `npm run typecheck`: run TypeScript in strict mode
- `npm run test`: run Vitest with coverage
- `npm run lint`: run ESLint
- `npm run example`: start the Vite example app

## Contribution guidelines

- Keep the published package headless. UI libraries belong in examples, not in the public runtime surface.
- Prefer pure helpers plus thin React glue. Derived behavior should be testable without DOM-specific handlers.
- Add or update tests for every behavioral change, especially around field typing, operation availability, and filter normalization.
- Use Conventional Commits such as `feat:`, `fix:`, or `refactor:`.

## Pull requests

- Describe the behavior change clearly.
- Link the related issue when relevant.
- Include screenshots or short recordings for example-app UI changes.
- Call out any breaking API changes in the PR description and README updates.
