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
- GitHub Pages deploys the built example app from `example/dist` on pushes to `main`

## Contribution guidelines

- Keep the published package headless. UI libraries belong in examples, not in the public runtime surface.
- Prefer pure helpers plus thin React glue. Derived behavior should be testable without DOM-specific handlers.
- Add or update tests for every behavioral change, especially around field typing, operation availability, and filter normalization.
- Use Conventional Commits such as `feat:`, `fix:`, `deps:`, or `refactor:`.
- PR titles are checked in CI and should also follow Conventional Commits. The PR title is the maintainer-facing release summary, even when the preview is derived from commits.

## Pull requests

- Describe the behavior change clearly.
- Link the related issue when relevant.
- Include screenshots or short recordings for example-app UI changes.
- Call out any breaking API changes in the PR description and README updates.
- Read the automated release preview comment before merge. It shows the likely bump from the PR commits, the projected next release if merged now, and whether the PR title matches that bump.

## Releases

- Releases are managed by Release Please on `main`.
- Do not manually edit `CHANGELOG.md` or bump versions for standard releases.
- The first automated modern release will bootstrap from the historical `1.x` line to `v2.0.0`.
- Release PRs should pass CI before merge. To make that happen reliably, configure a `RELEASE_PLEASE_TOKEN` repository secret so Release Please PRs are created with a token that can trigger normal pull request workflows.
- npm publishing supports either the existing `NPM_TOKEN` secret or npm trusted publishing from GitHub Actions. The workflow prefers `NPM_TOKEN` when present and otherwise falls back to trusted publishing.
