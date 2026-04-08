# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```sh
# Development (watch mode)
yarn start

# Build
yarn build

# Test (all)
yarn test

# Test (single file)
yarn test src/hooks/useQueryFilters.test.tsx

# Lint
yarn lint

# Storybook
yarn storybook

# Check bundle size
yarn size
```

Tests run automatically as a pre-commit hook via husky.

## Architecture

This is a headless React hook library for building query filter UIs. The main export is `useQueryFilters` — it manages all filter state and returns props that consumers use to wire up their own UI components.

**Core data flow:**

1. Caller passes `properties` (field definitions with `key`, `label`, `type`, and optional `suggestions`) to `useQueryFilters`
2. The hook maintains two parallel lists via `useList`: `filters` (the serializable filter state) and `selectStates` (UI-only select component state)
3. The hook returns `filters`, `onAddFilter`, and `createFilterRowProps(index)` — callers call `createFilterRowProps` per filter row to get all props needed to render that row
4. The `Filter` type is the serializable output (field, operation, value, binding, type); `FilterSelectState` tracks the corresponding select option objects for controlled select inputs

**Key design constraints:**

- The first filter row never has a `binding` — enforced reactively in a `useEffect` inside `useQueryFilters`
- Operations available per row depend on the selected field's `type` (`string` | `number` | `boolean`), driven by `defaultTypeOperationsMap` in `operations.ts`
- Certain operations (`IS_EMPTY`, `IS_NOT_EMPTY`) suppress the value input — controlled by `noValueOperations`

**UI implementations** live under `src/components/` — two reference implementations are provided (chakra-ui and react-select) but neither is part of the published package. The package only exports from `src/index.tsx`: types, bindings, operations, and the hook.

**Build tooling:** [tsdx](https://github.com/jaredpalmer/tsdx) — outputs CJS and ESM bundles to `dist/`. Size limit enforced at 10 KB per bundle.

**Releases:** Automated via `semantic-release` on the `main` branch through GitHub Actions.
