# Database Operations

Table handles expose a consistent CRUD surface across every schema. Each helper mirrors the structure of the API docs: headline summary plus a focused example you can copy/paste.

| Helper                                  | Returns                                 | Description                                                                                 |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `insert(values \| values[])`            | `Promise<RowEnvelope \| RowEnvelope[]>` | Encodes values, ensures table IDs exist, then calls `createDatabasePage`.                   |
| `select(options?)`                      | `Promise<SelectResult<Row>>`            | Compiles predicates/sorts via `src/orm/query/compiler.ts` and proxies to `queryDataSource`. |
| `update(patch, targets)`                | `Promise<RowEnvelope[]>`                | Encodes the patch, resolves targets (`pageIds` or predicates), and issues Notion updates.   |
| `archive(targets)` / `restore(targets)` | `Promise<RowEnvelope[]>`                | Thin wrappers over `updateRows` that toggle the `archived` flag.                            |

> Provisioning new databases? Run through `docs/orm/first-run-seeding.md` first so every handle has stable IDs before you start inserting rows.

## Setup

```ts
import { defineTable, text, checkbox } from "@/orm/schema";

const tasks = await defineTable(
  "Operations Demo",
  {
    title: text("Name").title(),
    done: checkbox("Done").default(false),
  },
  { parentId: process.env.NOTION_PARENT_PAGE_ID! }
);
```

Keep a single table handle in memory and reuse it for every operation below.

## Insert rows

```ts
const inserted = await tasks.insert({ title: "Run database ops" });
// inserted.row contains decoded column data; inserted.page is the raw Notion object
```

- Array inserts are supported: pass an array of values to batch new rows in one call.
- Under the hood, `insert` resolves cached `{ databaseId, dataSourceId }`, builds the Notion payload, and calls `createDatabasePage`.

## Select rows

```ts
import { eq, asc } from "@/orm/query";

const result = await tasks.select({
  where: eq(tasks.columns.title, "Run database ops"),
  orderBy: asc(tasks.columns.title),
  pageSize: 10,
});

const [row] = result.rows;
```

- `where`, `orderBy`, `pageSize`, and `nextCursor` mirror Notion’s query surface but keep type safety via the column builders.
- You can also pass `rawFilter` or `rawSorts` if you need a shape that is not covered by the helpers.

## Update rows

```ts
const inserted = await tasks.insert({ title: "Patch demo" });

await tasks.update({ done: true }, { pageIds: [inserted.page.id] });
```

- The patch respects your column codecs, so `null`/`default` handling stays consistent.
- Target rows either via explicit `pageIds` or by using the same predicate helpers you use for `select` (`{ where: eq(...) }`).

## Archive and restore rows

```ts
const { page } = await tasks.insert({ title: "Archive demo" });

await tasks.archive({ pageIds: [page.id] });
await tasks.restore({ pageIds: [page.id] });
```

- Both helpers call the same `updateRows` implementation with `archived: true/false`, so they share filtering behavior with `update`.
- Each helper throws contextual errors (table name + column names) when Notion rejects a payload, matching the diagnostics you get from the lower-level API docs.
