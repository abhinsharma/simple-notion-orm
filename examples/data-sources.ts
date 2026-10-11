/**
 * Data source workflow: inspect a database's data sources, read one schema, query rows, and list users.
 *
 * Run against a real workspace:
 *   NOTION_API_KEY=... TASKS_DATABASE_ID=... pnpm tsx examples/data-sources.ts
 *
 * The script only reads data.
 */
import { getDatabase, getDataSource, getSelf, isDatabasePageObject, listUsers, queryDataSource } from "simple-notion-orm";
import { pathToFileURL } from "node:url";
import { requireEnv } from "./env";

export async function run(env: NodeJS.ProcessEnv) {
  const { database } = await getDatabase(requireEnv(env, "TASKS_DATABASE_ID"));
  const dataSourceIds = database.data_sources.map((source) => source.id);

  const first = await getDataSource(dataSourceIds[0]!);
  const rows = await queryDataSource(first.id, { page_size: 5 });

  const bot = await getSelf();
  const users = await listUsers();

  return {
    dataSourceIds,
    propertyTypes: Object.fromEntries(Object.entries(first.properties).map(([name, property]) => [name, property.type])),
    rowIds: rows.results.filter(isDatabasePageObject).map((row) => row.id),
    botName: bot.name,
    userCount: users.length,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run(process.env).then((result) => console.log(result));
}
