# Changelog

## 0.1.0 (unreleased)

This release moves the package to `@notionhq/client` 5.27 and Notion API version `2026-03-11`, adds missing API and ORM features, and fixes several type bugs. The minor version goes up because of the breaking changes listed below.

### Breaking changes

- Clients made by `createNotionClient` and `getNotionClient` send `Notion-Version: 2026-03-11`. Pass `notionVersion` to `createNotionClient` to pin another version.
- Trash updates send `in_trash`. API version 2026-03-11 rejects `archived`. The `archived` option on `updatePage` and `updateDatabasePage` still works and is deprecated in favor of `inTrash`.
- Append requests send `position`. The `after` option still works and is sent as `position: { type: "after_block" }`.
- Media block factories take `{ type: "external", url }` or `{ type: "file_upload", id }`. The old `{ type: "file", url }` source built payloads that the API rejects.
- `RelationLinkConfig` is no longer generic. Relation maps take any table handle through the new `AnyTableHandle` type.
- `ComparisonOperator` includes the new operators, so exhaustive switches over it need new cases.

### Added

- `NOTION_API_VERSION` export and a `notionVersion` option on `createNotionClient`.
- Data source helpers: `getDataSource`, `createDataSource`, `updateDataSource`. `createDatabasePage` accepts `dataSourceId`.
- `defineTable` accepts `dataSourceId` to attach to one data source of a multi-source database. ORM inserts use the data source as the page parent, and `linkRelations` patches the table's own data source.
- `archiveDatabase` and `restoreDatabase`.
- `movePage`.
- `updateComment` and `deleteComment`.
- `getUser`, `getSelf`, and `listUsers`.
- `table.selectAll()` follows pagination cursors and returns every matching row. It throws when Notion reports that the query hit its result limit, and `select` results carry an `incomplete` flag for the same case.
- Query predicates `notContains`, `startsWith`, and `endsWith`. `contains` works for URL, email, phone number, and relation columns.
- Read-only `formula` and `rollup` column builders. `defineTable` can create a formula column from an expression.
- `buildHeadingBlock` supports level 4.
- Block transforms handle `heading_4`, `tab`, and `meeting_notes` blocks. The older `transcription` type maps to `meeting_notes`.
- `examples/` with runnable scripts. The test suite runs each one against mocked API responses.

### Fixed

- Standalone block conversion preserves nested children without a custom callback.
- The data-source example no longer requires user-list access, so it works with personal access tokens.
- `.default()` on column builders makes the column optional in the insert type. The runtime already filled in the default.
- `rel(table, "column")` compiles for tables made by `defineTable`. Relation keys used to resolve to `never`, and `addRelations` accepted any key.
- `updateBlock` accepts block content such as `paragraph` without a cast.
- `buildHeadingBlock` returns a type keyed by level, so the SDK request types accept it.
- Factories that take `children` infer the child block types, so nested factory blocks need no casts.
- Published type declarations resolve under `moduleResolution: "nodenext"`. They used to import SDK types through an extensionless deep path, which Node ESM resolution rejects.
- Documentation examples import from `simple-notion-orm` instead of internal path aliases, and several examples that did not type-check are corrected.

### Tooling

- TypeScript 7 (native compiler) for type checks and builds. The `typescript` package name points at `@typescript/typescript6` for typescript-eslint, which does not support TypeScript 7 yet.
- ESLint 10 with `eslint-plugin-import-x` and `@eslint-community/eslint-plugin-eslint-comments`, Vitest 5, MSW 3, Prettier 3.9, zod 4.6, dotenv 18, and pnpm 12.
- CI runs on Node 24 and adds a separate type check step.
- `release:check` runs lint, formatting, types, tests, and a clean build. Packing builds fresh output, and publishing runs the full check.
- Test discovery only includes source tests, so stale compiled tests in `dist` cannot break validation.
