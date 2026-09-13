# Changelog

## 0.1.0 - 2026-09-13

- Upgrade the Notion SDK to 5.26.0 and use API version `2026-03-11`.
- Send `in_trash` for page archive/restore and translate append `after` to Notion's `position` object. Existing helper options remain available.
- Resolve database page creation to a data source, with an explicit `dataSourceId` option. ORM inserts reuse the cached source ID.
- Update nested block factory types and comment inputs for the current SDK. Newly encountered block kinds return the existing `unsupported` simplified representation instead of throwing.
- Upgrade dependencies, pnpm, Vitest, ESLint, and CI actions. Replace unmaintained lint plugins with compatible successors. Keep TypeScript on 6.0.3 while the lint parser does not support 7.0.
- Clean the build directory before emitting the package, fix published-package imports in the README, and test current API request payloads.

This minor release changes SDK response types and requires Node.js 22.13 or newer. Read `in_trash` instead of `archived` on API responses. Configure any externally supplied SDK client for API version `2026-03-11`.
