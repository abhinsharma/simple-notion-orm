# Basics

Start here to understand what the ORM provides before diving into builders, relations, or predicates.

| Helper                                                 | Returns                                                         | Description                                                                                            |
| ------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `defineTable(title, columns, options)`                 | `Promise<TableHandle>`                                          | Validates an existing database (via `databaseId`) or creates one under a parent page (via `parentId`). |
| `TableHandle#getIds()`                                 | `{ databaseId, dataSourceId }`                                  | Cached identifiers reused by every CRUD helper.                                                        |
| `TableHandle#columns`                                  | Column builders keyed by the names you passed to `defineTable`. | Enables strongly typed predicates and patches.                                                         |
| `TableHandle#insert/#select/#update/#archive/#restore` | Various row envelopes and metadata                              | CRUD helpers implemented in `src/orm/operations/**` that call the API wrappers for you.                |

## Create a table under a parent page

```ts
import { defineTable, text, people, relation } from "@/orm/schema";

const tasks = await defineTable(
  "Playground Tasks",
  {
    title: text("Name").title(),
    assignees: people("Assignees").optional(),
    projects: relation("Projects"),
  },
  { parentId: process.env.NOTION_PARENT_PAGE_ID! }
);

const { databaseId, dataSourceId } = tasks.getIds();
```

- `defineTable` compiles codecs (`parse`, `encode`, `config`) from the column builders, provisions the schema, and caches identifiers so subsequent operations skip redundant network calls.
- The returned handle exposes every CRUD helper plus the `columns` map you need for selectors.

## Attach to an existing database

```ts
import { defineTable, text, checkbox } from "@/orm/schema";

const tasks = await defineTable(
  "Existing Tasks",
  {
    title: text("Name").title(),
    done: checkbox("Done").default(false),
  },
  { databaseId: process.env.TASKS_DATABASE_ID! }
);

// Validation happens automatically; schema mismatches throw with column names.
```

- Passing `databaseId` tells the ORM to fetch the remote schema via `src/api/database` and verify every column builder.
- Use this path when you already have a Notion database and only need typed access plus CRUD helpers.

## Work with the table handle

```ts
const inserted = await tasks.insert({ title: "Track basics" });
const fetched = await tasks.select();
await tasks.update({ done: true }, { pageIds: [inserted.page.id] });
```

- CRUD helpers live in `src/orm/operations/{insert,select,update,archive}.ts` and wrap the low-level API modules (`src/api/database-page`, `src/api/database`, `src/api/block`).
- Input/return types (`RowEnvelope`, `RowInput`, `RowPatch`, etc.) are defined in `src/orm/schema/types.ts`, keeping the surface predictable and in sync with the codecs.
