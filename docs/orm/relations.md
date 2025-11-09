# Relations

Relation columns require an existing data source on the Notion side, so the ORM focuses on validating schemas and moving raw IDs around reliably.

| Requirement                            | Why it matters                                                                                                    |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Target relation must already exist     | The Notion API cannot create both sides at once; `defineTable` only validates schema (`src/api/database`).        |
| Provide `{ id: string }` entries       | `relationCodec` ensures payloads only contain IDs; it will throw if a different shape appears.                    |
| Use `databaseId` for remote validation | When attaching to a live DB, relation properties must match by name, otherwise `defineTable` fails fast.          |
| Hydrate related rows manually          | Table handles return raw arrays of `{ id }`; use the low-level API wrappers if you need the related page content. |

## Configure a relation column

```ts
import { defineTable, text, relation } from "@/orm/schema";

const tasks = await defineTable(
  "Linked Tasks",
  {
    title: text("Title").title(),
    project: relation("Project"),
  },
  { parentId: process.env.NOTION_PARENT_PAGE_ID! }
);
```

- Include `relation("Project")` only if the destination database already exposes a matching relation property in Notion.
- The codec guarantees inserts/updates only send `{ id: string }` objects to Notion.

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
import { getPage } from "@/api/page";

const { rows } = await tasks.select();
const related = await Promise.all(rows.flatMap((row) => row.project.map((ref) => getPage(ref.id))));
```

- Table handles return the decoded column data plus the raw page envelope; use those IDs with `getPage`, `getDatabasePage`, or other APIs when you need full related details.
- Keep relation mappings documented in your schema definitions to avoid schema-validation errors during the `defineTable` sync step.
