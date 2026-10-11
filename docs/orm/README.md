# Simple Notion ORM Docs

Use this folder the same way you use `docs/api` and `docs/factories`: start with the summary table, then jump straight into the example you need.

| File                     | What you learn                                                                                               | Example focus                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `basics.md`              | Table lifecycles, handle state, and the role of codecs.                                                      | Provision a table with `defineTable`, reuse an existing DB, and read cached `{ databaseId, dataSourceId }`. |
| `column-builders.md`     | Every column builder, including `formula` and `rollup`, plus the modifiers you can chain.                    | Compose schemas with `.title()`, `.optional()`, and `.default()` before passing them to `defineTable`.      |
| `relations.md`           | How relation columns validate, when they require pre-existing data sources, and how the ORM returns raw IDs. | Insert rows that link to another database and hydrate related records with the low-level API wrappers.      |
| `database-operations.md` | CRUD helpers exposed on table handles and what each one calls under the hood.                                | Run `insert`, `select`, `selectAll`, `update`, `archive`, and `restore` against the same table handle.      |
| `selectors.md`           | Predicate helpers (`eq`, `contains`, `startsWith`, `and`, etc.) and sort descriptors.                        | Chain `where`, `orderBy`, and `rawFilter/rawSorts` to mirror the Notion filter/sort shape.                  |
| `first-run-seeding.md`   | Creating related tables from scratch and linking relations after creation.                                   | Run `parentId` → `linkRelations` → cache IDs in `.env`.                                                     |
| `multi-workspace.md`     | Binding tables to different Notion clients and the API version those clients send.                           | Pass `client` to `defineTable` and `NotionPage`.                                                            |

Each doc mirrors the “table + focused examples” pattern used in `docs/api`, so everything stays consistent for contributors.
