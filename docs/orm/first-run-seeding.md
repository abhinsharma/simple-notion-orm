# First-Run Creation and Seeding Guide

This guide shows how to create multiple related tables the first time (using `parentId`), then switch to `databaseId` for subsequent runs. It also covers deferring relation properties until all data source IDs exist.

## Overview

- First run (seed):
  - Define tables (declare relation columns as intent only).
  - Create each table with `{ parentId }`.
  - Patch relation properties after creation (requires target `data_source_id`).
  - Print an ID report and save `databaseId`s in your `.env`.
- Subsequent runs:
  - Attach to existing tables with `{ databaseId }` only; no `parentId` needed.

## ID Cheat Sheet

- `databaseId` — use to attach a table handle and update DB metadata.
- `dataSourceId` — used internally for queries and required in relation property configs. It is re-derived from the database each run.

## Step-by-Step (seed)

```ts
import { defineTable, text, relation, linkRelations, rel } from "simple-notion-orm";

async function seed() {
  const parentId = process.env.NOTION_ROOT_PAGE!;

  // Create tables (first run: use parentId; later: use databaseId from .env)
  const projects = await defineTable(
    "Projects",
    { title: text("Title").title() },
    process.env.PROJECTS_DB ? { databaseId: process.env.PROJECTS_DB } : { parentId }
  );

  const tasks = await defineTable(
    "Tasks",
    {
      title: text("Title").title(),
      project: relation("Project"), // intent only; relation patched below
    },
    process.env.TASKS_DB ? { databaseId: process.env.TASKS_DB } : { parentId }
  );

  // Phase 2: link relations after both data sources exist
  await linkRelations([
    rel(tasks, "project").to(projects).single(),
    // Or dual: .dual({ syncedPropertyName: "Tasks" })
  ]);

  // Emit ID report for .env
  const ids = {
    PROJECTS_DB: projects.getIds().databaseId,
    TASKS_DB: tasks.getIds().databaseId,
  };
  console.log(
    "\nID Report (.env):\n" +
      Object.entries(ids)
        .map(([k, v]) => `${k}=${v}`)
        .join("\n")
  );
}
```

## Subsequent Runs

- Replace `{ parentId }` with `{ databaseId: <saved DB ID> }` per table.
- The ORM re-fetches the `data_source_id` from the database automatically.

## Relation Property Shapes (for reference)

- Single-property:

```json
{
  "relation": { "data_source_id": "<TARGET_DS>", "type": "single_property", "single_property": {} }
}
```

- Dual-property:

```json
{
  "relation": { "data_source_id": "<TARGET_DS>", "type": "dual_property", "dual_property": { "synced_property_name": "Tasks" } }
}
```

## Notes

- Import `linkRelations` and `rel` from `simple-notion-orm`. They patch relation properties through `dataSources.update` on the source table's data source.
- Persist `dataSourceId` for databases with multiple sources. Passing `databaseId` alone attaches to the first source.
