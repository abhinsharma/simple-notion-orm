# Capability limits in 0.1.0

These limits describe the current implementation. They do not prevent releasing the supported API.

## Queries and mutations

`selectAll` follows all available cursors. If Notion reports that a query is incomplete, it throws rather than return an apparently complete result. Add a narrower filter before retrying.

Predicate-based `update`, `archive`, and `restore` select a single page, at most 100 rows. `update` changes one row unless `many: true` or multiple explicit `pageIds` are supplied. Use `selectAll` to collect IDs before a larger mutation. Supply explicit IDs to restore trashed pages.

Typed predicates do not cover formula/rollup results or relative date ranges. Use `rawFilter` for those, and `rawSorts` for timestamp sorts without a column.

## Relations and computed properties

Notion page responses can truncate relation and people arrays. The ORM currently decodes the returned values without requesting additional property pages. `populate` fetches related pages only for the references already present.

Relation population changes values at runtime; its TypeScript return type still reflects the declared relation references. Validate populated fields before relying on them.

Formula and rollup values are read-only. Creating a formula needs an expression. Create rollup properties separately after linking their relation, then attach a `rollup` column to the existing schema.

## Files and newer APIs

Media block factories accept existing Notion upload IDs. The package does not orchestrate file uploads, and the `files` column cannot write upload IDs.

Place, verification, button, location, and last-visited properties do not have ORM column builders. Several newer SDK endpoints also have no wrapper, including page templates, locking, markdown, views, custom emojis, meeting-note queries, and agents. Use `createNotionClient` and the underlying SDK for these endpoints.

## Token permissions

Personal access tokens cannot list workspace users. `getSelf` can retrieve the token's identity. `listUsers` requires an integration token with user information capabilities. See [Notion's user-list documentation](https://developers.notion.com/reference/get-users).
