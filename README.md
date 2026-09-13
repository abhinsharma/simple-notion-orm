# Simple Notion ORM

Simple Notion ORM is a schema first toolkit that turns Notion’s powerful but type heavy API into a familiar Drizzle style workflow. It provides builders, codecs, and helpers so you can treat both standalone pages and database rows (which are themselves pages) as predictable application data.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Installation](#installation)
- [Quick Preview](#quick-preview)
- [Core Ideas](#core-ideas)
- [Project Layout](#project-layout)
- [Command Palette](#command-palette)
- [Documentation Map](#documentation-map)
- [Feedback](#feedback)

## Overview

Notion exposes every page, block, and database through the same flexible JSON surface. That flexibility becomes painful when you need static typing, column level validation, or consistent payloads. Simple Notion ORM wraps `@notionhq/client` with:

- Drizzle inspired table definitions that compile into Notion property configs.
- Column builders that know how to parse and encode Notion payloads.
- Virtual “page handles” so you can work with single stand alone pages or with database items as typed rows.
- Factories and transforms that keep request/response shapes predictable.
- Page update helpers can append block content via the `append` option on `updatePage` and `updateDatabasePage`.

Bring your own workspace, point the ORM at an existing database (or ask it to create one), and work with TypeScript types instead of raw REST payloads.

## Setup

1. **Requirements:** Node.js ≥ 22.13 and `pnpm` (the repo pins `pnpm@12.3.4`).
2. **Install dependencies:** run the commands below from the repo root.
3. **Configure secrets:** create `.env` and set `NOTION_API_KEY=secret_from_notion`.
4. **Reference Notion targets:** set `NOTION_TASKS_DB` or whichever database IDs you want to work with before running samples.

## Installation

```bash
pnpm add simple-notion-orm
# or
npm install simple-notion-orm
# or
yarn add simple-notion-orm
```

## Quick Preview

```ts
import { defineTable, text, status, people } from "simple-notion-orm";

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

## Core Ideas

### Schema-first tables inspired by Drizzle

- `defineTable` pairs a human readable title with column builders such as `text`, `number`, `status`, `relation`, and `people`.
- Each builder configures optionality, nullability, defaults, and Notion specific modifiers (for example, `.title()` for the primary column).
- Behind the scenes, codecs convert from app friendly values to Notion payloads and back, so TypeScript catches mistakes before any API calls.

### Two page abstractions

- **Standalone page handles** let you orchestrate single pages (landing pages, docs, etc.) without touching database metadata.
- **Database row handles** expose CRUD helpers on top of Notion databases; each row is still a page, but the ORM adds typed column accessors and metadata like `{ databaseId, dataSourceId }`.
- Because both abstractions speak the same typed language, you can move data between ad hoc pages and structured tables without re learning the API.

### Composable codecs and factories

- Codecs in `src/orm/codecs/**` describe how to parse outgoing requests and decode responses.
- Factories under `src/factories/**` help you build Notion payloads (blocks, properties, transforms) when you need to drop down to the raw API.
- Shared utilities (`src/transform`, `src/utils`) keep schemas, payload builders, and runtime helpers in sync.

### System metadata helpers

- Use `createdTime`, `lastEditedTime`, `createdBy`, `lastEditedBy`, and `uniqueId` column builders when you want Notion’s auto-maintained metadata.
- These columns are read-only: inserts/updates throw if you try to set them, but you can filter/sort on them just like regular columns.
- For new databases, declare your relations up front and then run `linkRelations(...)` (see `docs/orm/first-run-seeding.md`) once every table has a `data_source_id`.

## Project Layout

```
src/
├── api/         # Thin wrappers around @notionhq/client (pages, databases, sources)
├── orm/         # Schema DSL, codecs, table/page handles, and helpers
├── factories/   # Builders for Notion blocks, properties, and payload fragments
├── transform/   # Data conversion utilities shared across layers
├── types/       # Type definitions for schemas, codecs, and Notion payloads
└── utils/       # Cross cutting helpers (env, error formatting, etc.)
```

Docs live alongside the codebase so every layer stays well explained (see [Documentation Map](#documentation-map)).

## Command Palette

```bash
pnpm install               # Install dependencies
pnpm lint                  # ESLint flat config with TypeScript support
pnpm format                # Format the codebase with Prettier
pnpm tsc                   # Type-check source and tests
pnpm test                  # Run the offline Vitest + MSW suite
pnpm build                 # Build ESM JavaScript and declarations in dist
pnpm format:check          # Verify formatting without writing changes
```

## Documentation Map

- `docs/api` – API usage guides that cover pages, blocks, and data sources.
- `docs/factories` – Property/block builders and payload recipes.
- `docs/pages` – Higher level helpers like `NotionPage` that sit above the raw SDK.
- `docs/orm` – ORM concepts, codecs, and schema DSL walkthroughs.

## Compatibility and releases

Version 0.1.0 uses Notion API `2026-03-11` and `@notionhq/client` 5.26.0. Read trash state from `in_trash` in responses. The existing `archived` page-update option and archive/restore helpers still work; they send `in_trash` to Notion. The existing append `after` option sends a `position` object. You can also pass `position` to `appendBlockChildren` directly.

Clients supplied by your application must use `notionVersion: "2026-03-11"`. `createNotionClient` and the environment-backed default client set this version automatically.

`createDatabasePage` resolves the primary data source from `databaseId`. Pass `dataSourceId` as well to select a specific source or skip that lookup. ORM inserts use the table's cached data-source ID.

Development uses Node.js 24 LTS and pnpm 12.3.4. Newer package versions inside this environment's seven-day release-age window are deferred. TypeScript 6.0.3 is the newest version supported by the current TypeScript ESLint parser.

See [CHANGELOG.md](CHANGELOG.md) for migration notes and [docs/releasing.md](docs/releasing.md) for the release checklist.
