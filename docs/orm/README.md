# Simplified Notion ORM

The ORM layer wraps our Notion API clients with a typed schema DSL, column builders, and codec-driven transforms. It lets you treat Notion databases like typed tables while still exposing the underlying Notion payloads when you need them.

---

## Table Handles At A Glance

```ts
import { defineTable, text, status, people, relation } from "@/orm/schema";

const tasks = await defineTable(
  "Tasks",
  {
    title: text("Name").title(),
    assignees: people("Assignees").optional(),
    status: status("Status").nullable(),
    projects: relation("Projects"),
  },
  { databaseId: process.env.NOTION_TASKS_DB! } // or { parentId } to create
);

// Insert
await tasks.insert({
  title: "Ship ORM codecs",
  assignees: [{ id: "user-123" }],
  status: { name: "In Progress" },
});

// Select returns typed rows
const rows = await tasks.select();
rows[0].assignees?.[0].id; // string
```

`defineTable` returns a table handle with typed `rows`, `insert`, and `columns` metadata (future predicate support). Types flow from the column builders, so optional and nullable flags are enforced at compile time.

---

## Core Concepts

### Column Builders & Codecs

| Builder             | App Type                    | Notion Property         | Notes                                                    |
| ------------------- | --------------------------- | ----------------------- | -------------------------------------------------------- |
| `text(name)`        | `string`                    | `rich_text` / `title()` | Call `.title()` to switch to the primary title property. |
| `number(name)`      | `number \| null`            | `number`                | `.nullable()` keeps `null` in the row output.            |
| `date(name)`        | `DatePropertyInput \| null` | `date`                  | Accepts `{ start, end?, time_zone? }`.                   |
| `checkbox(name)`    | `boolean`                   | `checkbox`              | `.optional()` allows omission on insert.                 |
| `url(name)`         | `string \| null`            | `url`                   | `.nullable()` keeps `null`.                              |
| `select(name)`      | `SelectOptionInput \| null` | `select`                | Works with `{ id }` or `{ name }` values.                |
| `multiSelect(name)` | `SelectOptionInput[]`       | `multi_select`          |                                                          |
| `status(name)`      | `SelectOptionInput \| null` | `status`                | Creation requires the column to already exist in Notion. |
| `people(name)`      | `{ id: string }[]`          | `people`                | Accepts/returns arrays of user references.               |
| `relation(name)`    | `{ id: string }[]`          | `relation`              | IDs only; population happens separately (see roadmap).   |

Every builder exposes:

- `.optional()` – column may be omitted from inserts.
- `.nullable()` – column can store `null` and returns `null` in selects.
- `.default(value)` – default value for future insert helpers (stored in metadata).
- Additional modifiers (`title()`, `status()`, …) depending on the property type.

Behind the scenes each builder uses a `NotionCodec`:

- `parse(appValue)` → Notion property payload for creates/updates.
- `encode(property)` → App value when reading rows.
- `config(name)` → Database property config used during `defineTable({ parentId })`.

### Table Lifecycle

`defineTable(title, columns, options)` accepts either:

- `options.databaseId`: attach to an existing Notion database. We validate the remote schema and reuse its primary data source.
- `options.parentId`: create a new database under the given page. Schema config is compiled from the codecs.

> ⚠️ Relation columns: the Notion API still requires a pre-configured target data source. In practice, only use `{ parentId }` when the schema has no relations or provision the relation property manually beforehand.

Table handles cache `{ databaseId, dataSourceId }` after the first sync and expose `getIds()` if callers need to inspect them.

### CRUD Surface

| Method          | Signature                                         | Notes                                                                                   |
| --------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `insert(data)`  | `Promise<RowOutput>`                              | Validates against column codecs; currently writes a single page per call.               |
| `select()`      | `Promise<RowOutput[]>`                            | Returns decoded rows; each row field matches the builder type (`string`, `{ id }[]`, …) |
| _(coming soon)_ | `update`, `archive`, `populate`, query predicates | Roadmap items (see `ai-docs/stories/index.md`).                                         |

All errors include column/table context. Codec validation happens before any network traffic.

---

## Working With Option Columns

`select`, `multiSelect`, and `status` columns accept either `{ id }` or `{ name }` objects. Use the factories under `src/factories/properties` if you need helpers for Notion option shapes. When syncing schemas, make sure the remote database already has the expected option values; the API currently ignores option configurations on create.

---

## Relations & People

- `people("Assignees")` reads and writes arrays of `{ id: string }`. Additional metadata (names, emails) can be fetched via the Users API if needed.
- `relation("Projects")` also works with `{ id: string }[]`. Until populate support (ST‑012) lands, the ORM returns raw IDs only; you can manually hydrate related pages using the existing Notion API clients.

When creating databases with relations, call `defineTable` in `databaseId` mode so the schema matcher verifies the existing relation configuration instead of trying to create it.

---

## Extending The ORM

- Add new column builders under `src/orm/schema/column-builders/`.
- Implement codecs in `src/orm/codecs/**` using `createNotionCodec`.
- Update tests under `tests/codecs/` for each new property type.
- Keep docs in sync by expanding this file when new builders or table methods land.

---

## Further Reading

- RFC and technical plans live under `ai-docs/` (`RFC Simplified Notion ORM.md`, `tech/orm-schema-sync.md`, `tech/orm-codecs.md`, etc.).
- The schema DSL implementation is in `src/orm/schema/**`.
- Codec definitions live in `src/orm/codecs/**`.
- API wrappers (pages, databases, data sources) are documented in `docs/api/`.

These guides evolve alongside the stories in `ai-docs/stories/index.md`; check the story tracking doc for the latest roadmap.
