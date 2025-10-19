# Repository Guidelines

## Project Structure & Module Organization
- `src/` houses the TypeScript source:
  - `api/` – Notion wrappers (pages, blocks, databases).
  - `factories/` – block/property payload builders.
  - `utils/`, `types/` – shared helpers and type aliases.
- `tests/fixtures/` contains obfuscated JSON responses used by MSW-based tests.
- `docs/` and `ai-docs/` hold reference material (API usage, design stories, factories).
- `playground.ts` is a scratch pad for manual flows (reset to minimal use after each run).

## Build, Test, and Development Commands
- `pnpm lint` – Run ESLint with the configured project-flat rules.
- `pnpm build` – Type-check via `tsc --noEmit`.
- `pnpm tsx playground.ts` – Execute the playground script (temporarily expand as needed).
- `pnpm test` (when implemented) – reserved for the Vitest/MSW suite.

## Coding Style & Naming Conventions
- TypeScript, strict mode; 2-space indentation enforced by ESLint.
- Use named exports; no default exports except where explicitly allowed (e.g., `vitest.config.ts`).
- Internal imports rely on `@/` path aliases (`@/api/...`, `@/factories/...`).
- Run `pnpm lint` before pushing to ensure formatting and ordering rules pass.

## Testing Guidelines
- MSW + Vitest power integration tests under `src/**/__tests__`.
- Fixture files live in `tests/fixtures`; obfuscate identifiers before committing.
- Follow the existing naming pattern `*.test.ts` with `describe`/`it`.
- Clear the capture page (`clearPageContent`) after manual runs to avoid fixture drift.

## Commit & Pull Request Guidelines
- Commit messages follow short, imperative verbs (`feat:`, `docs:`, `fix:`).
- Keep commits scoped (docs vs fixtures vs code).
- PRs should include:
  - What changed and why (link Story/Issue when possible).
  - Verification notes (lint/build/test commands run).
  - Screenshots or JSON diffs when docs/fixtures change.

## Security & Configuration Tips
- Secrets (`NOTION_API_KEY`, `CAPTURE_PAGE_ID`) live in `.env`; never commit them.
- Use `clearPageContent` or dedicated test databases to avoid leaking real workspace data.
- Obfuscate IDs/URLs in fixtures before committing (`tests/fixtures/*` script snippets already demonstrate patterns).
