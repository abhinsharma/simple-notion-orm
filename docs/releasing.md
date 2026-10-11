# Prepare a release

The package version is `0.1.0`. It is prepared but has not been published. The current npm release is `0.0.15`.

## Validate the checkout

Use Node.js 24 and the pnpm version pinned in `package.json`. Start from a clean `main` checkout after CI passes.

```bash
pnpm install --frozen-lockfile
pnpm release:check
npm pack --dry-run
npm pack
```

`release:check` runs lint, formatting, type checking, tests, and a clean build. `prepack` rebuilds before producing the tarball. Inspect the package listing: it should contain `dist`, `README.md`, `CHANGELOG.md`, `LICENSE`, and `package.json`, with no `.env`, test fixtures, or local output.

Install `simple-notion-orm-0.1.0.tgz` into a separate temporary project. Verify a Node.js ESM import and TypeScript consumers with `moduleResolution: "nodenext"` and `"bundler"`, with `skipLibCheck: false`.

## Live API acceptance

Use disposable Notion pages and databases. Provide `NOTION_API_KEY` through the environment or an ignored `.env` file. Environment variables take precedence. A database for the examples needs `Name` as a title property and `Stage` as a select property.

```bash
TASKS_DATABASE_ID=<test-database-id> pnpm tsx examples/tasks-table.ts
TASKS_DATABASE_ID=<test-database-id> pnpm tsx examples/data-sources.ts
PAGE_ID=<test-page-id> pnpm tsx examples/page-content.ts
```

The page-content example leaves blocks and a comment on its test page. Archive that page afterward. Verify row creation, querying, updates, trash/restore, nested blocks, and relations on the selected data source.

For this release, all three examples and 11 live checks passed with a personal access token. The automated suite has 132 passing tests. The [capability limits](./limitations.md) remain applicable.

## Publish later

Publishing is a separate action. When authorized, confirm that version `0.1.0` is still unused on npm, date the changelog entry, and rerun validation on the exact commit to publish. Review the npm account and package contents, then publish using the repository's required pnpm installation. `prepublishOnly` runs `release:check` before publishing.

Create the `v0.1.0` tag and GitHub release only after npm publication succeeds. Verify installation by version from npm before announcing the release.
