# Column Builders

Every builder below is exported from `@/orm/schema/index.ts` and wraps a codec in `src/orm/codecs/**`. The codec trio (`parse`, `encode`, `config`) keeps TypeScript types aligned with the Notion payloads, and `defineTable` uses `config` when provisioning schemas.

| Builder                          | Description                                                                                                             | Modifiers                                                                                   |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `text(name)`                     | Rich text column; call `.title()` exactly once per table to promote it to the primary title.                            | `.title()`, `.optional()`, `.nullable()`, `.default(value)`                                 |
| `number(name)`                   | Number column, accepts `null` after `.nullable()`.                                                                      | `.optional()`, `.nullable()`, `.default(value)`                                             |
| `date(name)`                     | Date/date-range column supporting `{ start, end?, time_zone? }`.                                                        | `.optional()`, `.nullable()`, `.default(value)`                                             |
| `checkbox(name)`                 | Boolean checkbox column.                                                                                                | `.optional()`, `.default(value)`                                                            |
| `url(name)`                      | URL column with trimming and optional clearing.                                                                         | `.optional()`, `.nullable()`, `.default(value)`                                             |
| `email(name)`                    | Email column; values are trimmed before being sent to Notion.                                                           | `.optional()`, `.nullable()`, `.default(value)`                                             |
| `phoneNumber(name)`              | Phone number column; spaces and formatting are preserved but trimmed before validation.                                 | `.optional()`, `.nullable()`, `.default(value)`                                             |
| `files(name)`                    | Files column (array of file/external references).                                                                       | `.optional()`, `.default(value)`                                                            |
| `select(name)`                   | Single-select column; chain `.options([...])` for typed unions (defaults allow ad-hoc values).                          | `.optional()`, `.nullable()`, `.default(value)`, `.options([...])`, `.allowCustomOptions()` |
| `multiSelect(name)`              | Multi-select column where `.options([...])` narrows allowed tags just like select columns.                              | `.optional()`, `.default(value)`, `.options([...])`, `.allowCustomOptions()`                |
| `status(name)`                   | Status column (Notion must already have the options configured).                                                        | `.optional()`, `.nullable()`, `.default(value)`                                             |
| `people(name)`                   | People column storing arrays of `{ id: string }`.                                                                       | `.optional()`, `.default(value)`                                                            |
| `relation(name)`                 | Relation column storing linked page IDs; use `linkRelations` to materialize schema on first run.                        | `.optional()`, `.default(value)`                                                            |
| `uniqueId(name, { prefix })`     | Notion Unique ID column (auto-increment, read-only). Decodes to `{ number, prefix, value }`.                            | `.optional()`, `.nullable()`                                                                |
| `createdTime(name)`              | Read-only Notion `created_time` property (ISO string).                                                                  | `.optional()`, `.nullable()`                                                                |
| `lastEditedTime(name)`           | Read-only Notion `last_edited_time` property (ISO string).                                                              | `.optional()`, `.nullable()`                                                                |
| `createdBy(name)`                | Read-only Notion `created_by` property (returns `{ id: string }`).                                                      | `.optional()`, `.nullable()`                                                                |
| `lastEditedBy(name)`             | Read-only Notion `last_edited_by` property (returns `{ id: string }`).                                                  | `.optional()`, `.nullable()`                                                                |
| `formula(name, { expression? })` | Read-only formula result: a string, number, boolean, date, or `null`. Pass `expression` so `defineTable` can create it. | `.optional()`, `.nullable()`                                                                |
| `rollup(name)`                   | Read-only rollup result as `{ type, function, number \| date \| array }`. Existing databases only.                      | `.optional()`, `.nullable()`                                                                |

Need rich text (not title)? Keep using `text()`; there isn’t a separate `richText()` export.

Use these builders to define your table schema; the modifiers chain before you pass the column map to `defineTable`.

> **Read-only metadata**: `uniqueId`, `createdTime`, `lastEditedTime`, `createdBy`, `lastEditedBy`, `formula`, and `rollup` are computed by Notion. Inserts/updates throw if you try to set them.

> **Formula and rollup creation**: `defineTable` creates a formula column only when you pass an `expression`. It cannot create rollup columns, because a rollup points at a relation that `linkRelations` adds after the database exists. Add rollups in Notion or with `updateDatabase`, then declare them with `rollup(name)`.

> **Status note**: Notion’s API still blocks status property creation through `createDatabase`. Use the `status()` builder only when you pass `databaseId` (existing schema) or when the target Notion database already exposes the status column you reference.

## Define a schema with builders

```ts
import { defineTable, text, number, select } from "simple-notion-orm";

const roadmap = await defineTable(
  "Feature Roadmap",
  {
    title: text("Name").title(),
    effort: number("Effort").optional(),
    status: select("Status").default({ name: "Backlog" }),
  },
  { parentId: process.env.NOTION_PARENT_PAGE_ID! }
);

await roadmap.insert({ title: "Expand docs coverage", effort: 2 });
```

- `text("Name").title()` promotes the column to the Notion title property.
- `.optional()` removes the required constraint on inserts, while `.default()` pre-populates missing values.

## Provide defaults and nullable values

```ts
import { defineTable, number, date, text } from "simple-notion-orm";

const estimates = await defineTable(
  "Estimates",
  {
    name: text("Name").title(),
    effort: number("Effort").default(1),
    due: date("Due").nullable(),
  },
  { parentId: process.env.NOTION_PARENT_PAGE_ID! }
);

await estimates.insert({ name: "Docs pass", due: null });
// encodes Effort as { number: 1 } and Due as { date: null }
```

- `.default(1)` fills the value during `insert` when the caller leaves it out, and it makes the column optional in the insert type. Updates only send the columns you pass.
- `.nullable()` tells the codec to accept `null` and encode the Notion “clear this value” payload. A nullable column is still required on insert unless you also call `.optional()` or `.default()`.

## Type-safe select and multi-select options

Call `.options([...])` on `select()` or `multiSelect()` to lock the column to a literal union of options and seed those options when the ORM provisions a database. The helpers accept either raw strings or full option objects; chaining `.allowCustomOptions()` afterwards opt-ins back to “accept anything” behavior (useful when you still want Notion users to add one-off values).

```ts
import { defineTable, select, multiSelect, text } from "simple-notion-orm";

const tasks = await defineTable(
  "Typed Selects",
  {
    title: text("Name").title(),
    stage: select("Stage").options(["Backlog", "In Progress", "Done"] as const),
    tags: multiSelect("Tags")
      .options([
        { name: "Docs", color: "green" },
        { name: "ORM", color: "purple" },
      ])
      .allowCustomOptions(),
  },
  { parentId: process.env.NOTION_PARENT_PAGE_ID! }
);

await tasks.insert({
  title: "Demo typed selects",
  stage: { name: "Backlog" },
  tags: [{ name: "Docs" }, { name: "ORM" }, { name: "Experimental" }], // last entry allowed because of .allowCustomOptions()
});
```

- Without `.allowCustomOptions()` the compiler only accepts the literal options you listed (helpful for workflow states).
- The same `.options([...])` payload becomes the Notion property configuration when `defineTable` creates a new database, so you keep code and schema aligned.

## Read formula and rollup values

```ts
import { defineTable, formula, rollup, text } from "simple-notion-orm";

const projects = await defineTable(
  "Projects",
  {
    name: text("Name").title(),
    budgetLeft: formula("Budget left"),
    totalHours: rollup("Total hours"),
  },
  { databaseId: process.env.PROJECTS_DATABASE_ID! }
);

for (const row of await projects.selectAll()) {
  const hours = row.data.totalHours.type === "number" ? row.data.totalHours.number : null;
  console.log(row.data.name, row.data.budgetLeft, hours);
}
```
