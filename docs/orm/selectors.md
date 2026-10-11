# Selectors

Predicate helpers live under `src/orm/query/predicates.ts` and compose into `SelectOptions.where` or `orderBy`. They mirror the layout used in `docs/api` so you always start with a table and drop into the examples you need.

| Helper                                     | Works with                                                     | Description                             |
| ------------------------------------------ | -------------------------------------------------------------- | --------------------------------------- |
| `eq(column, value)`                        | Text, number, checkbox, date, select/status, URL, email, phone | Equals filter.                          |
| `neq(column, value)`                       | Same as `eq`                                                   | Not-equals filter.                      |
| `contains(column, value)`                  | Text, URL, email, phone, multi-select, people, relation        | Substring, option, user or page match.  |
| `notContains(column, value)`               | Same as `contains`                                             | Negated `contains`.                     |
| `startsWith` / `endsWith`                  | Title, rich text, URL, email, phone                            | Prefix or suffix match on text.         |
| `gt` / `gte`                               | Numbers, dates                                                 | Greater-than comparisons.               |
| `lt` / `lte`                               | Numbers, dates                                                 | Less-than comparisons.                  |
| `isNull` / `isNotNull`                     | All columns                                                    | Empty/non-empty checks.                 |
| `and(...predicates)` / `or(...predicates)` | Any predicates                                                 | Combine filters with boolean logic.     |
| `asc(column)` / `desc(column)`             | Sortable columns                                               | Sort descriptors used inside `orderBy`. |

`compileQueryOptions` in `src/orm/query/compiler.ts` turns these helpers into the exact `queryDataSource` filter/sort payloads. If you need something not covered, pass `rawFilter` or `rawSorts` alongside the helpers.

People and relation filters take an ID string or an object with an `id`, so you can pass a row's `page` or a user reference directly. Formula and rollup columns have no predicate helpers because the filter shape depends on the result type. Use `rawFilter` for them.

> **Literal select values**: When you chain `.options([...])` on `select`/`multiSelect` builders, the predicate helpers only accept the listed literal values, so `eq(tasks.columns.stage, { name: "Done" })` can’t accidentally reference a misspelled option.

## Filter rows with predicates

```ts
import { defineTable, text, checkbox, contains, eq } from "simple-notion-orm";

const tasks = await defineTable("Selector Demo", { title: text("Name").title(), done: checkbox("Done") }, { parentId: process.env.NOTION_PARENT_PAGE_ID! });

const result = await tasks.select({
  where: contains(tasks.columns.title, "docs"),
});

const unchecked = await tasks.select({
  where: eq(tasks.columns.done, false),
});
```

- Pass any predicate helper to `where`; the compiler automatically scopes it to the column metadata.
- Combine predicates with `and(...)` or `or(...)` for more complex filters.

## Match text and relations

```ts
import { and, contains, defineTable, notContains, relation, startsWith, text } from "simple-notion-orm";

const tasks = await defineTable(
  "Tasks",
  { title: text("Name").title(), project: relation("Project").optional() },
  { databaseId: process.env.TASKS_DATABASE_ID! }
);

const drafts = await tasks.select({
  where: and(startsWith(tasks.columns.title, "Draft"), notContains(tasks.columns.title, "old"), contains(tasks.columns.project, "project-page-id")),
});
```

## Sort rows

```ts
import { asc, desc } from "simple-notion-orm";

const sorted = await tasks.select({
  orderBy: [asc(tasks.columns.done), desc(tasks.columns.title)],
});
```

- Provide one descriptor or an array; sorts are applied in order, just like Notion’s native query API.
- Sort helpers share the same column typing guarantees as predicates, so you cannot accidentally sort on an undefined column.

## Drop down to raw filters

```ts
const custom = await tasks.select({
  rawFilter: {
    property: "Name",
    title: { starts_with: "Selector" },
  },
  rawSorts: [{ timestamp: "created_time", direction: "descending" }],
});
```

- `rawFilter`/`rawSorts` go straight to Notion’s SDK for the rare cases where the helper surface does not cover a native filter.
- A raw value replaces the matching helper value. `rawFilter` wins over `where`, and `rawSorts` wins over `orderBy`.
