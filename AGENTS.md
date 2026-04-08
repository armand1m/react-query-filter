# Repository Guidelines

## Project Structure & Module Organization

`src/` contains the published library. The low-level grouped-filter engine lives in `src/core.ts` and `src/hooks/useQueryFilters.ts`, while the recommended consumer API lives in `src/types.ts` and `src/hooks/useFilterBuilder.ts`. Keep `src/index.tsx` focused on stable public exports. The demo app in `example/src/` should always reflect the recommended integration path, not internal-only APIs. Build output goes to `dist/` and is generated. Release automation config lives in `release-please-config.json`, `.release-please-manifest.json`, and `.github/workflows/`.

## Build, Test, and Development Commands

Use `npm` for local work.

- `npm run dev`: watch the library build with `tsup`.
- `npm run build`: create ESM/CJS bundles and declarations in `dist/`.
- `npm run test`: run Vitest with coverage.
- `npm run lint`: run ESLint.
- `npm run typecheck`: run TypeScript for both library and example.
- `npm run example`: start the Vite example app.
- `npm run validate`: run formatting checks, lint, typecheck, tests, and build.

## Design & Architecture Principles

Keep the library headless, but optimize for low-friction usage. The primary API should hide tree complexity behind schema helpers and typed controllers so developers do not need to manually traverse nodes, juggle ids, or learn tree internals before they can ship a UI. Favor a schema-first builder facade for onboarding and keep raw tree utilities as an advanced layer.

Type safety is non-negotiable. New APIs should improve autocomplete quality, preserve typed field keys and value shapes, and avoid consumer-side casts such as `as Binding` or `as OperationType`. Do not require manual coercion like `Boolean()`, `String()`, or `Number()` in example or recommended consumer code; prefer typed controller props and native-friendly adapters instead.

Recursive groups are a core capability, but the mental model should stay simple. Group combinators belong to groups, not to each row. When adding abstractions, prefer controller methods such as `addCondition()`, `addGroup()`, `setField()`, and `setValue()` over generic tree mutation helpers.

## Coding Style & Naming Conventions

Use TypeScript, React, 2-space indentation, LF line endings, and single quotes. Follow Prettier and `eslint.config.js`. Use named exports. Keep public API names intention-revealing and beginner-friendly. Reserve terse or highly generic helpers for internal code only if they are not part of the recommended surface.

## Example App Guidelines

The example app is a DX artifact, not just a demo. It should show the easiest correct integration with native elements first, use the builder facade instead of low-level hooks, and stay compact and desktop-friendly. Prefer icon-assisted controls, realistic grouped-filter flows, and immediate starter state over empty onboarding screens. If consumer code in the example feels verbose or needs casts/parsing, treat that as a library DX bug.

## Testing Guidelines

Tests use Vitest and `@testing-library/react`. Add tests next to implementation as `*.test.tsx`. Cover recursive behavior, controlled/uncontrolled state, controller helpers, schema inference, and any API intended for direct consumer use. Changes to the recommended DX path should include example-facing or facade-facing tests, not only low-level tree tests.

## Commit & Pull Request Guidelines

Follow Conventional Commits such as `feat:`, `fix:`, `deps:`, and `test:`. Keep commits scoped to a coherent behavior change. PR titles must also use Conventional Commits because release automation checks them and maintainers rely on the release preview comment for expected bump information. Pull requests should explain user-facing DX impact, especially when changing the public API, example integration path, or type surface. Call out breaking changes and migration implications explicitly.

## Release Automation

Release Please owns normal version bumps, changelog updates, GitHub Releases, and npm publishing. Do not hand-edit `CHANGELOG.md` or version fields for routine releases. If release behavior needs to change, update the release workflow and Release Please config together so the release PR, GitHub Release, npm publish step, and PR preview comment stay consistent.
