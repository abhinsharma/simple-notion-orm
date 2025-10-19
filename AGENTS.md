# Repository Guidelines

## Project Structure & Module Organization
- `src/` houses the TypeScript source:
  - `api/` – Notion wrappers (pages, blocks, databases).
  - `factories/` – block/property payload builders.
  - `orm/` – (future) higher-level abstractions for the ORM surface.
  - `transform/`, `utils/`, `types/` – shared transforms, helpers, and type definitions.
- `tests/fixtures/` contains obfuscated JSON responses used by MSW-based tests.
- `docs/` and `ai-docs/` hold reference material (API usage, design stories, factories).
- `playground.ts` is a scratch pad for manual flows (reset to minimal use after each run).

## Build, Test, and Development Commands
- `pnpm tsc` – Standalone type check (alias for `tsc --noEmit`).
- `pnpm lint` – Run ESLint with the configured project-flat rules.
- `pnpm lint --fix` – Auto-fix lint issues where possible.
- `pnpm format` / `pnpm format:check` – Prettier formatting at `printWidth: 160`.
- `pnpm build` – Type-check via `tsc --noEmit`.
- `pnpm tsx playground.ts` – Execute the playground script (temporarily expand as needed).
- `pnpm test` / `vitest run <path>` – Run the Vitest + MSW suite (see `tests/handlers.ts` scaffolding).

## Coding Style & Naming Conventions
- TypeScript, strict mode; 2-space indentation enforced by ESLint.
- Use named exports; no default exports except where explicitly allowed (e.g., `vitest.config.ts`).
- Internal imports rely on `@/` path aliases (`@/api/...`, `@/factories/...`).
- Run `pnpm lint` before pushing to ensure formatting and ordering rules pass.

## Architecture Overview
- **API layer (`src/api/`)** wraps `@notionhq/client` calls (pages, blocks, databases, database pages). `database.ts` returns `{ database, dataSource }`.
- **Factories (`src/factories/`)** build payloads for properties, schemas, and blocks.
- **Transform/utils/types** host cross-cutting helpers; path aliases point to these modules (`@/api/*`, `@/factories/*`, etc.).

## Path Aliases
Configured in `tsconfig.json` and `vitest.config.ts`:
```
@/api/*        -> src/api/*
@/orm/*        -> src/orm/*
@/factories/*  -> src/factories/*
@/utils/*      -> src/utils/*
@/types/*      -> src/types/*
@/constants/*  -> src/constants/*
@/transform/*  -> src/transform/*
```
Prefer these over relative imports.

## Environment Setup
- `.env` must contain `NOTION_API_KEY`.
- `dotenv` is loaded inside `src/api/client.ts`; tests stub secrets in `tests/setup-msw.ts`.
- Use dedicated playground pages/databases to avoid affecting production data.

## Testing Guidelines
- MSW + Vitest power integration tests (`src/**/__tests__`, `tests/setup-msw.ts`, `tests/handlers.ts`).
- Fixture files live in `tests/fixtures`; obfuscate identifiers/URLs before committing.
- Follow the existing naming pattern `*.test.ts` with `describe`/`it`. Use factories inside tests when shaping payloads.
- Clear the capture page (`clearPageContent`) after manual runs to avoid fixture drift.
- When overriding handlers, use `server.use(...)` in `beforeEach` as shown in existing tests.

## Commit & Pull Request Guidelines
- Commit messages follow short, imperative verbs (`feat:`, `docs:`, `fix:`).
- Keep commits scoped (docs vs fixtures vs code).
- PRs should include:
  - What changed and why (link Story/Issue when possible).
  - Verification notes (lint/build/test commands run).
  - Screenshots or JSON diffs when docs/fixtures change.

- ## Security & Configuration Tips
- Secrets (e.g., `NOTION_API_KEY`) live in `.env`; never commit them.
- Use `clearPageContent` or dedicated test databases to avoid leaking real workspace data.
- Obfuscate IDs/URLs in fixtures before committing (`tests/fixtures/*` script snippets already demonstrate patterns).
- Use worktrees stored under `../simple-notion-orm-worktrees` for parallel feature work (`git worktree add ../simple-notion-orm-worktrees/<branch> -b <branch> main`).
