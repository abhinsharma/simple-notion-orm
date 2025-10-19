# Simple Notion ORM

Simple Notion ORM is a typed toolkit layered on top of `@notionhq/client`. It ships schema builders, payload factories, and thin API wrappers so pages, databases, and blocks can be managed as predictable data structures.

## Project Structure & Architecture

```
src/
├── api/           # Raw API wrappers (thin layer over @notionhq/client)
├── orm/           # ORM layer (higher-level abstractions)
├── factories/     # Builder functions for Notion objects
├── transform/     # Data transformation utilities
├── types/         # TypeScript type definitions
└── utils/         # Shared utilities
```

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
   Tweak it as needed, then restore the minimal example and run `clearPageContent` to tidy the capture page.

## Development Commands
- `pnpm tsc` – Standalone type check (`tsc --noEmit`).
- `pnpm lint` / `pnpm lint --fix` – ESLint flat config with TypeScript rules.
- `pnpm format` / `pnpm format:check` – Prettier with `printWidth: 160`.
- `pnpm build` – Type-check pipeline (alias for `tsc --noEmit` used in CI).
- `pnpm test` / `vitest run <path>` – Vitest + MSW suite (see `tests/handlers.ts`).
- `pnpm tsx playground.ts` – Run the playground script during manual experiments.


## Testing
- Tests are powered by [Vitest](https://vitest.dev/) and MSW.
- Fixtures in `tests/fixtures/*.json` provide deterministic responses (IDs/URLs are obfuscated).
- Run a single test file: `pnpm test src/api/__tests__/page.test.ts`.
- Override handlers with `server.use(...)` when customizing MSW responses (see existing tests).

## Environment & Configuration
- Required secrets: `NOTION_API_KEY`, `CAPTURE_PAGE_ID`.
- `src/api/client.ts` loads environment variables via `dotenv`.
- Prefer sandbox pages/databases for playground work and call `clearPageContent` after manual runs.

## Documentation
- [`docs/api`](./docs/api) – API usage guides and examples.
- [`docs/factories`](./docs/factories) – Block/property/schema builder references.
- [`AGENTS.md`](./AGENTS.md) – Contributor workflow and repository conventions.
- [`CLAUDE.md`](./CLAUDE.md) – Claude-specific guidance (now points back to `AGENTS.md`).
