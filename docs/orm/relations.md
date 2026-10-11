# Relations

Relation columns rely on Notion data sources. Since a brand-new workspace doesn’t have those IDs yet, the ORM now uses a two-phase flow:

1. **Create databases** with `parentId` (relation columns are declared but skipped during provisioning).
2. **Link relations** once every table exists, using the new `linkRelations()` helper (or the `table.addRelation()` sugar).

See `docs/orm/first-run-seeding.md` for a complete seeding walkthrough.

| Requirement                          | Why it matters                                                                                        |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Use `parentId` only on the first run | A fresh database doesn’t have IDs yet; once it exists, switch to `databaseId` and cache it in `.env`. |
| Use `data_source_id` for relations   | Relation properties require the target data source ID (not the database ID).                          |
| Provide `{ id: string }` entries     | `relationCodec` ensures payloads only contain IDs; it will throw if a different shape appears.        |
| Register relation metadata           | Use `defineRelations` before selecting with `populate`, or retrieve related pages directly by ID.     |
| Batch links with `addRelations`      | When a table links to many targets, a single call keeps all wiring in one place.                      |

## Configure a relation column

```ts
import { defineTable, text, relation } from "simple-notion-orm";

const tasks = await defineTable(
  "Linked Tasks",
  {
    title: text("Title").title(),
    project: relation("Project"),
  },
  process.env.TASKS_DB ? { databaseId: process.env.TASKS_DB } : { parentId: process.env.NOTION_PARENT_PAGE_ID! }
);
```

- First run: omit `TASKS_DB`, pass `parentId`, then call `linkRelations` (see below) to materialize the relation.
- Later runs: set `TASKS_DB=<database_id>` in your `.env` so the ORM attaches directly.

## Link relations after creation

```ts
import { linkRelations, rel } from "simple-notion-orm";

await linkRelations([
  rel(tasks, "project").to(projects).single(),
  // dual example: rel(tasks, "project").to(projects).dual({ syncedPropertyName: "Tasks" })
]);

// or use the table sugars
await tasks.addRelation("project", projects, { type: "single_property" });
await tasks.addRelations({
  project: { target: projects, options: { type: "dual_property", syncedPropertyName: "Tasks" } },
});
```

- `single()` creates a one-way relation property on the source table.
- `dual()` lets you mirror the relation on the target by providing the synced property metadata.
- `addRelations` batches multiple columns for the same table and still calls `linkRelations` under the hood, so use it when you have lots of links to configure.

## Insert rows with linked IDs

```ts
await tasks.insert({
  title: "Document relation column",
  project: [{ id: "project-page-id" }],
});
```

- `project` accepts arrays, so you can link multiple records in a single call.
- When updating, pass the whole relation value you want to persist; Notion replaces the list instead of patching individual entries.

## Hydrate related records

```ts
import { getPage } from "simple-notion-orm";

const { rows } = await tasks.select();
const related = await Promise.all(rows.flatMap((row) => row.data.project.map((ref) => getPage(ref.id))));
```

For decoded related rows, register the target table and request population:

```ts
import { defineRelations } from "simple-notion-orm";

defineRelations(tasks, { project: projects });
const populated = await tasks.select({ populate: { project: ["title"] } });
```

`populate` replaces references at runtime with the requested fields. Its return type still uses the declared relation column type, so narrow or validate populated values before using their extra fields. It does not fetch relation entries that Notion omitted from a truncated page response.

- Table handles return the decoded column data plus the raw page envelope; use those IDs with `getPage`, `getDatabasePage`, or other APIs when you need full related details.
- Keep relation mappings documented in your schema definitions to avoid schema-validation errors during the `defineTable` sync step.

## ID cheat sheet

| ID type        | When to use it                                                                                         |
| -------------- | ------------------------------------------------------------------------------------------------------ |
| `databaseId`   | Attach a table handle to an existing Notion database; update DB-level metadata via `databases.update`. |
| `dataSourceId` | Query rows (`select` calls `dataSources.query`) and configure relation properties.                     |

`table.getIds()` returns both. Persist `dataSourceId` when a database has multiple data sources; `databaseId` alone selects the first source.
