# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the published library. Core types and enums live in `src/types.ts`, `src/operations.ts`, `src/bindings.ts`, and `src/core.ts`, while the public hook lives in `src/hooks/`. The local demo app is in `example/` with its own `src/` entrypoint. Build output goes to `dist/` and should be treated as generated artifacts.

## Build, Test, and Development Commands

Use `npm` for local work.

- `npm run dev`: watches the library build with `tsup`.
- `npm run build`: creates ESM/CJS bundles and declarations in `dist/`.
- `npm run test`: runs the Vitest suite with coverage.
- `npm run lint`: runs ESLint.
- `npm run typecheck`: runs TypeScript in strict mode.
- `npm run example`: starts the Vite example app.
- `npm run validate`: runs formatting checks, lint, typecheck, tests, and build.

## Coding Style & Naming Conventions

This repository uses TypeScript and React with 2-space indentation, LF line endings, and single quotes. Follow Prettier and the flat ESLint config in `eslint.config.js`; prefer running `npm run validate` before submitting changes. Use named exports. Keep hooks in camelCase files such as `useQueryFilters.ts`, colocate tests as `*.test.tsx`, and keep the published package headless rather than bundling UI kits into `src/`.

## Testing Guidelines

Tests use Vitest and `@testing-library/react`. Add tests next to the code they verify, following the existing `*.test.tsx` pattern, for example `src/hooks/useQueryFilters.test.tsx`. Cover state transitions, operation changes, normalization, and controlled-mode behavior. Run `npm run test` locally before opening a PR.

## Commit & Pull Request Guidelines

Follow Conventional Commits as already used in history: `feat: ...`, `fix: ...`, `test: ...`. Keep messages imperative and scoped to one change. Pull requests should explain the behavior change, reference the relevant issue when applicable, and include screenshots or Storybook notes for UI-facing updates. Call out any API or breaking changes explicitly.
