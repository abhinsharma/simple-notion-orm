/**
 * Typed table workflow: attach to a database, insert, query, page through, update, and trash rows.
 *
 * Run against a real workspace:
 *   NOTION_API_KEY=... TASKS_DATABASE_ID=... pnpm tsx examples/tasks-table.ts
 *
 * The database needs a title property named "Name" and a select property named "Stage".
 */
import { asc, defineTable, eq, select, startsWith, text } from "simple-notion-orm";
import { pathToFileURL } from "node:url";
import { requireEnv } from "./env";

export async function run(env: NodeJS.ProcessEnv) {
  const tasks = await defineTable(
    "Tasks",
    {
      name: text("Name").title(),
      stage: select("Stage").default({ name: "Todo" }),
    },
    { databaseId: requireEnv(env, "TASKS_DATABASE_ID") }
  );

  const created = await tasks.insert({ name: "Example row" });

  const firstPage = await tasks.select({
    where: startsWith(tasks.columns.name, "Example"),
    orderBy: asc(tasks.columns.name),
    pageSize: 10,
  });

  const allTodo = await tasks.selectAll({ where: eq(tasks.columns.stage, "Todo") });

  const updated = await tasks.update({ stage: { name: "Done" } }, { pageIds: [created.page.id] });
  const trashed = await tasks.archive({ pageIds: [created.page.id] });

  return {
    createdId: created.page.id,
    createdStage: created.data.stage,
    firstPageCount: firstPage.rows.length,
    hasMore: firstPage.hasMore,
    allTodoCount: allTodo.length,
    updatedStage: updated.data.stage,
    trashed,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run(process.env).then((result) => console.log(result));
}
