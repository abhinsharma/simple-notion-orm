# Simple Notion ORM

Simple Notion ORM provides typed table definitions, row codecs, block factories, and page helpers on top of `@notionhq/client`. Use it to create or query Notion databases and read or update page content.

The API and examples below describe **0.1.0**. See the [migration notes](./CHANGELOG.md#breaking-changes) before upgrading.

## Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [Installation](#installation)
- [Notion API version](#notion-api-version)
- [Quick start](#quick-start)
- [Runnable examples](#runnable-examples)
- [Limitations](#limitations)
- [Core Ideas](#core-ideas)
- [Project Layout](#project-layout)
- [Command Palette](#command-palette)
- [Documentation Map](#documentation-map)
- [Release preparation](#release-preparation)

## Overview

Notion exposes every page, block, and database through the same flexible JSON surface. That flexibility becomes painful when you need static typing, column level validation, or consistent payloads. Simple Notion ORM wraps `@notionhq/client` with:

- Drizzle inspired table definitions that compile into Notion property configs.
- Column builders that know how to parse and encode Notion payloads.
- Virtual “page handles” so you can work with single stand alone pages or with database items as typed rows.
- Factories and transforms that keep request/response shapes predictable.
- Page update helpers can append block content via the `append` option on `updatePage` and `updateDatabasePage`.
- Data source helpers for databases with more than one data source.

Bring your own workspace, point the ORM at an existing database (or ask it to create one), and work with TypeScript types instead of raw REST payloads.

## Setup

Use Node.js 22 or later with ESM `import` syntax. Repository development uses pnpm 12.11.2 and is checked in CI on Node.js 24.

Set `NOTION_API_KEY` in your environment or a local `.env` file. An existing environment variable takes precedence over `.env`. You can use a personal access token or an integration token. For an integration token, share the target pages and databases with that integration. Personal access tokens use your own page permissions, but cannot list workspace users.

Never commit a token. The examples below use `TASKS_DATABASE_ID` for an existing database and `PAGE_ID` for a test page.

## Installation

```bash
pnpm add simple-notion-orm
# or
npm install simple-notion-orm
# or
yarn add simple-notion-orm
```

## Notion API version

The package targets Notion API version `2026-03-11` with `@notionhq/client` 5.27. Clients made by `createNotionClient` and the default `NOTION_API_KEY` client send that version. It is exported as `NOTION_API_VERSION`.

Version 2026-03-11 renamed `archived` to `in_trash`, replaced the append `after` parameter with `position`, and renamed the `transcription` block to `meeting_notes`. The helpers here send the new shapes and keep the older option names working. See [CHANGELOG.md](./CHANGELOG.md) for details.

## Quick start

Create a test database with a title property named `Name` and a select property named `Stage`. Set `TASKS_DATABASE_ID` to its database ID. This example creates a row, updates it, then moves it to the trash.

```ts
import { defineTable, eq, select, text } from "simple-notion-orm";

const tasks = await defineTable(
  "Tasks",
  {
    name: text("Name").title(),
    stage: select("Stage").default({ name: "Todo" }),
  },
  { databaseId: process.env.TASKS_DATABASE_ID! }
);

const created = await tasks.insert({ name: "Ship ORM codecs" });

const { rows } = await tasks.select({ where: eq(tasks.columns.stage, "Todo") });
console.table(rows.map((row) => row.data));

const everyTask = await tasks.selectAll();
console.log(everyTask.length);
await tasks.update({ stage: { name: "Done" } }, { pageIds: [created.page.id] });
await tasks.archive({ pageIds: [created.page.id] });
```

For a database with several data sources, pass `{ dataSourceId }` instead of `{ databaseId }` to select the intended schema.

## Runnable examples

From a repository checkout, run `pnpm install --frozen-lockfile` and `pnpm build`, then configure `NOTION_API_KEY` and the target IDs in the environment or `.env`:

```bash
TASKS_DATABASE_ID=<test-database-id> pnpm tsx examples/tasks-table.ts
TASKS_DATABASE_ID=<test-database-id> pnpm tsx examples/data-sources.ts
PAGE_ID=<test-page-id> pnpm tsx examples/page-content.ts
```

The task example creates, updates, and trashes its row. The data-source example only reads. The page-content example appends blocks and a comment, so use a disposable page and archive it afterward. All three examples have passed against the live Notion API with a personal access token; the automated suite also runs them against mocked responses.

## Limitations

- `selectAll` follows pagination, but throws when Notion reports an incomplete query. Narrow the filter in that case.
- Predicate-based bulk updates and archive/restore operations use one page of results, up to 100 rows. Explicit `pageIds` avoid that selection limit. A normal `update` changes one row; set `many: true` for a bulk update.
- Relation and people arrays can be truncated in page responses. The ORM does not fetch additional property pages automatically.
- Formula and rollup columns are read-only. Formula creation requires an expression; rollups must already exist. Their filters use `rawFilter`.
- There is no file-upload helper. Media factories accept an existing upload ID, but the `files` column does not support upload IDs.
- Some newer property types and SDK endpoints have no ORM wrapper. Use the underlying Notion client when needed.

See the [capability limits](https://github.com/abhinsharma/simple-notion-orm/blob/main/docs/limitations.md) for details. These limits remain part of 0.1.0.

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
pnpm tsc                   # Type check with the TypeScript 7 compiler
pnpm test                  # Run the Vitest + MSW suite, including the examples
pnpm build                 # Compile to dist/ with declarations
pnpm format                # Format the codebase with Prettier
pnpm format:check          # Verify formatting without writing changes
```

## Documentation Map

- [API guides](https://github.com/abhinsharma/simple-notion-orm/tree/main/docs/api) cover pages, blocks, data sources, comments, and users.
- [Factories](https://github.com/abhinsharma/simple-notion-orm/tree/main/docs/factories) document property and block payload builders.
- [Page helpers](https://github.com/abhinsharma/simple-notion-orm/tree/main/docs/pages) cover `NotionPage` and recursive block traversal.
- [ORM guides](https://github.com/abhinsharma/simple-notion-orm/tree/main/docs/orm) cover columns, queries, and relations.
- [Examples](https://github.com/abhinsharma/simple-notion-orm/tree/main/examples) contain the runnable scripts listed above.
- `CHANGELOG.md` – Release notes.

## Release preparation

Run `pnpm release:check` to validate the package. Follow the [release guide](https://github.com/abhinsharma/simple-notion-orm/blob/main/docs/releasing.md) to inspect and install the tarball before publishing. Publishing and creating a release tag are separate, manual steps.
