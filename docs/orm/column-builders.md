# Column Builders

Every builder below is exported from `@/orm/schema/index.ts` and wraps a codec in `src/orm/codecs/**`. The codec trio (`parse`, `encode`, `config`) keeps TypeScript types aligned with the Notion payloads, and `defineTable` uses `config` when provisioning schemas.

| Builder             | Description                                                                                      | Modifiers                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `text(name)`        | Rich text column that becomes the primary title when you call `.title()`.                        | `.title()`, `.optional()`, `.nullable()`, `.default(value)` |
| `number(name)`      | Number column, accepts `null` after `.nullable()`.                                               | `.optional()`, `.nullable()`, `.default(value)`             |
| `date(name)`        | Date/date-range column supporting `{ start, end?, time_zone? }`.                                 | `.optional()`, `.nullable()`, `.default(value)`             |
| `checkbox(name)`    | Boolean checkbox column.                                                                         | `.optional()`, `.default(value)`                            |
| `url(name)`         | URL column with trimming and optional clearing.                                                  | `.optional()`, `.nullable()`, `.default(value)`             |
| `email(name)`       | Email column; values are trimmed before being sent to Notion.                                    | `.optional()`, `.nullable()`, `.default(value)`             |
| `phoneNumber(name)` | Phone number column; spaces and formatting are preserved but trimmed before validation.          | `.optional()`, `.nullable()`, `.default(value)`             |
| `files(name)`       | Files column (array of file/external references).                                                | `.optional()`, `.default(value)`                            |
| `select(name)`      | Single-select column; accepts `{ name }` or `{ id }`.                                            | `.optional()`, `.nullable()`, `.default(value)`             |
| `multiSelect(name)` | Multi-select column supporting arrays of `{ name }`/`{ id }`.                                    | `.optional()`, `.default(value)`                            |
| `status(name)`      | Status column (Notion must already have the options configured).                                 | `.optional()`, `.nullable()`, `.default(value)`             |
| `people(name)`      | People column storing arrays of `{ id: string }`.                                                | `.optional()`, `.default(value)`                            |
| `relation(name)`    | Relation column storing linked page IDs; the ORM returns raw IDs until manual population occurs. | `.optional()`, `.default(value)`                            |

Use these builders to define your table schema; the modifiers chain before you pass the column map to `defineTable`.

> **Status note**: Notion’s API still blocks status property creation through `createDatabase`. Use the `status()` builder only when you pass `databaseId` (existing schema) or when the target Notion database already exposes the status column you reference.

## Define a schema with builders

```ts
import { defineTable, text, number, select } from "@/orm/schema";

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
import { defineTable, number, date } from "@/orm/schema";

const estimates = await defineTable(
  "Estimates",
  {
    effort: number("Effort").default(1),
    due: date("Due").nullable(),
  },
  { parentId: process.env.NOTION_PARENT_PAGE_ID! }
);

await estimates.insert({});
// encodes as { Effort: 1, Due: null }
```

- `.default(1)` runs during `insert` and `update` operations so you can skip boilerplate in callers.
- `.nullable()` tells the codec to accept `null` and encode the Notion “clear this value” payload when needed.
