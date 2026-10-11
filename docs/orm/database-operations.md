# Database Operations

Table handles expose a consistent CRUD surface across every schema. Each helper mirrors the structure of the API docs: headline summary plus a focused example you can copy/paste.

| Helper                                  | Returns                                 | Description                                                                                 |
| --------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `insert(values \| values[])`            | `Promise<RowEnvelope \| RowEnvelope[]>` | Encodes values, ensures table IDs exist, then calls `createDatabasePage`.                   |
| `select(options?)`                      | `Promise<SelectResult<Row>>`            | Compiles predicates/sorts via `src/orm/query/compiler.ts` and proxies to `queryDataSource`. |
| `selectAll(options?)`                   | `Promise<RowEnvelope[]>`                | Calls `select` until Notion reports no more pages, then returns every row.                  |
| `update(patch, targets)`                | `Promise<RowEnvelope \| RowEnvelope[]>` | Encodes the patch, resolves targets (`pageIds` or predicates), and issues Notion updates.   |
| `archive(targets)` / `restore(targets)` | `Promise<number>`                       | Move matching rows to the trash or restore them. Returns the number of rows changed.        |

> Provisioning new databases? Run through `docs/orm/first-run-seeding.md` first so every handle has stable IDs before you start inserting rows.

## Setup

```ts
import { defineTable, text, checkbox } from "simple-notion-orm";

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
// inserted.data contains decoded column data; inserted.page is the raw Notion object
```

- Array inserts are supported: pass an array of values and the ORM creates one row per value.
- Under the hood, `insert` resolves the cached `dataSourceId`, builds the Notion payload, and calls `createDatabasePage` with the data source as the parent.

## Select rows

```ts
import { asc, eq } from "simple-notion-orm";

const result = await tasks.select({
  where: eq(tasks.columns.title, "Run database ops"),
  orderBy: asc(tasks.columns.title),
  pageSize: 10,
});

const [row] = result.rows;
```

- `where`, `orderBy`, `pageSize`, and `startCursor` mirror Notion’s query surface but keep type safety via the column builders.
- The result carries `nextCursor` and `hasMore`. Pass `nextCursor` back as `startCursor` to read the next page.
- You can also pass `rawFilter` or `rawSorts` if you need a shape that is not covered by the helpers.

## Select every row

```ts
const allOpen = await tasks.selectAll({
  where: eq(tasks.columns.done, false),
});
```

- `selectAll` follows the cursors for you and fetches up to 100 rows per request. `pageSize` sets the batch size.
- It loads every matching row into memory, so add a `where` filter on large databases.
- Notion can stop a query at its result limit. `select` then returns `incomplete: true`, and `selectAll` throws instead of returning a partial list. Narrow the `where` filter and query again.

## Update rows

```ts
const inserted = await tasks.insert({ title: "Patch demo" });

await tasks.update({ done: true }, { pageIds: [inserted.page.id] });
```

- The patch respects your column codecs, so `null`/`default` handling stays consistent.
- Target rows either via explicit `pageIds` or by using the same predicate helpers you use for `select` (`{ where: eq(...) }`).
- An update changes one matching row by default. Set `many: true` to update every row in the selected page, up to 100 rows. To update more, select IDs with `selectAll` and pass those IDs with `many: true`.

## Archive and restore rows

```ts
const { page } = await tasks.insert({ title: "Archive demo" });

await tasks.archive({ pageIds: [page.id] });
await tasks.restore({ pageIds: [page.id] });
```

- Both helpers send `in_trash: true` or `in_trash: false` for each target and share the target options with `update`.
- Without `pageIds`, they act on the first page of matching rows, up to 100. Select IDs with `selectAll` and pass explicit `pageIds` for larger sets. Restoring requires explicit IDs for trashed rows because normal queries exclude them.
- Each helper throws contextual errors (table name + column names) when Notion rejects a payload, matching the diagnostics you get from the lower-level API docs.
