# Simple Notion ORM

Simple Notion ORM provides a thin, typed layer on top of the official Notion API. It packages schema builders, payload factories, and lightweight CRUD helpers so you can treat pages, databases, and blocks like first-class data structures without memorizing JSON shapes.

## Project Layout
- `src/api/` – High-level wrappers for Notion endpoints (pages, blocks, databases, database pages) with consistent error handling.
- `src/factories/` – Reusable builders for block payloads, property values, and database schemas.
- `tests/fixtures/` – Obfuscated Notion responses used by MSW-powered integration tests.
- `docs/` + `ai-docs/` – Living documentation: API usage guides, factory references, and story-driven design notes.
- `playground.ts` – Scratch file for manual experiments. Expand it temporarily, then reset to the minimal example when finished.

## Getting Started
1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Provide credentials in `.env`:
   ```
   NOTION_API_KEY=secret
   CAPTURE_PAGE_ID=page-id-for-playground
   ```
3. Exercise the playground:
   ```bash
   pnpm tsx playground.ts
   ```
   (Feel free to tweak while testing; run `clearPageContent` afterwards to tidy the capture page.)

## Development Commands
- `pnpm lint` – ESLint with flat configuration and TypeScript-aware ordering rules.
- `pnpm build` – Type-check via `tsc --noEmit`.
- `pnpm test` – Reserved for the forthcoming Vitest/MSW suite (see `tests/handlers.ts` scaffolding).

## Resources
- [`docs/api`](./docs/api) contains quick-start snippets for each API module.
- [`docs/factories`](./docs/factories) explains block/property/schema builders with examples.
- [`AGENTS.md`](./AGENTS.md) distills contributor guidelines (structure, workflow, commit style).

