# Simple Notion ORM

Simple Notion ORM is a schema-first toolkit that turns Notion’s powerful—but type-heavy—API into a familiar Drizzle-style workflow. It provides builders, codecs, and helpers so you can treat both stand-alone pages and database rows (which are themselves pages) as predictable application data.

## Table of Contents
- [Overview](#overview)
- [Quick Preview](#quick-preview)
- [Core Ideas](#core-ideas)
- [Project Layout](#project-layout)
- [Setup](#setup)
- [Command Palette](#command-palette)
- [Documentation Map](#documentation-map)
- [Feedback](#feedback)

## Overview

Notion exposes every page, block, and database through the same flexible JSON surface. That flexibility becomes painful when you need static typing, column-level validation, or consistent payloads. Simple Notion ORM wraps `@notionhq/client` with:

- Drizzle-inspired table definitions that compile into Notion property configs.
- Column builders that know how to parse and encode Notion payloads.
- Virtual “page handles” so you can work with single stand-alone pages or with database items as typed rows.
- Factories and transforms that keep request/response shapes predictable.

Bring your own workspace, point the ORM at an existing database (or ask it to create one), and work with TypeScript types instead of raw REST payloads.

## Quick Preview

```ts
import { defineTable, text, status, people } from "@/orm/schema";

const tasks = await defineTable(
  "Tasks",
  {
    title: text("Name").title(),
    assignees: people("Assignees").optional(),
    status: status("Status").nullable(),
  },
  { databaseId: process.env.NOTION_TASKS_DB! }
);

await tasks.insert({
  title: "Ship ORM codecs",
  assignees: [{ id: "user-123" }],
  status: { name: "In Progress" },
});

const rows = await tasks.select();
console.table(rows);
```

Expected output (the playground and fixtures return similar data):

```
┌─────────┬────────────────────┬───────────────┬────────────────┐
│ (index) │ title              │ status        │ assignees      │
├─────────┼────────────────────┼───────────────┼────────────────┤
│ 0       │ 'Ship ORM codecs'  │ 'In Progress' │ [ { id: ... } ]│
└─────────┴────────────────────┴───────────────┴────────────────┘
```

## Core Ideas

### Schema-first tables inspired by Drizzle
- `defineTable` pairs a human-readable title with column builders such as `text`, `number`, `status`, `relation`, and `people`.
- Each builder configures optionality, nullability, defaults, and Notion-specific modifiers (for example, `.title()` for the primary column).
- Behind the scenes, codecs convert from app-friendly values to Notion payloads and back, so TypeScript catches mistakes before any API calls.

### Two page abstractions
- **Standalone page handles** let you orchestrate single pages (landing pages, docs, etc.) without touching database metadata.
- **Database row handles** expose CRUD helpers on top of Notion databases; each row is still a page, but the ORM adds typed column accessors and metadata like `{ databaseId, dataSourceId }`.
- Because both abstractions speak the same typed language, you can move data between ad-hoc pages and structured tables without re-learning the API.

### Composable codecs and factories
- Codecs in `src/orm/codecs/**` describe how to parse outgoing requests and decode responses.
- Factories under `src/factories/**` help you build Notion payloads (blocks, properties, transforms) when you need to drop down to the raw API.
- Shared utilities (`src/transform`, `src/utils`) keep schemas, payload builders, and runtime helpers in sync.

## Project Layout

```
src/
├── api/         # Thin wrappers around @notionhq/client (pages, databases, sources)
├── orm/         # Schema DSL, codecs, table/page handles, and helpers
├── factories/   # Builders for Notion blocks, properties, and payload fragments
├── transform/   # Data conversion utilities shared across layers
├── types/       # Type definitions for schemas, codecs, and Notion payloads
└── utils/       # Cross-cutting helpers (env, error formatting, etc.)
```

Docs live alongside the codebase so every layer stays well explained (see [Documentation Map](#documentation-map)).

## Setup

1. **Requirements:** Node.js ≥ 22 and `pnpm` (the repo pins `pnpm@10.17.1`).
2. **Install dependencies:** run the commands below from the repo root.
3. **Configure secrets:** create `.env` and set `NOTION_API_KEY=secret_from_notion`.
4. **Reference Notion targets:** set `NOTION_TASKS_DB` or whichever database IDs you want to work with before running samples.
5. **Try the playground:** `pnpm tsx playground.ts` seeds a page, inserts rows, and calls helpers like `clearPageContent` so you can see the ORM in action.

## Command Palette

```bash
pnpm install               # Install dependencies
pnpm tsx playground.ts     # Run the interactive playground script
pnpm lint                  # ESLint flat config with TypeScript support
pnpm format                # Format the codebase with Prettier
pnpm build                 # Type-check (tsc --noEmit), also used in CI
pnpm format:check          # Verify formatting without writing changes
```

## Documentation Map

- `docs/api` – API usage guides that cover pages, blocks, and data sources.
- `docs/factories` – Property/block builders and payload recipes.
- `docs/orm` – ORM concepts, codecs, and schema DSL walkthroughs.
- `AGENTS.md` – Contributor workflow, branching model, and automation rules.
- `CLAUDE.md` – Assistant-specific contribution notes (mirrors `AGENTS.md`).

## Feedback

Open an issue or PR if you spot stale information, want a new example, or need better coverage for your Notion workflow. The README should evolve whenever we add new column builders, codecs, or page abstractions—file a ticket if something drifts.
