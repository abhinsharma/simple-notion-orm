/**
 * Notes: status columns must be provisioned manually before using builders. Always reset the
 * playground after experiments and keep sandbox data clean.
 * Use a dedicated sandbox page/database, and reset this file after experiments.
 */
import { defineTable, multiSelect, relation, select, status, text } from "@/orm";
import "dotenv/config";

const log = (message: string) => process.stdout.write(`${message}\n`);
const logError = (message: string) => process.stderr.write(`${message}\n`);

async function main() {
  const parentId = process.env.PLAYGROUND_PAGE_ID;

  if (!parentId) {
    logError("Set PLAYGROUND_PAGE_ID in your .env file to run playground flows.");
    return;
  }

  log(`Playground ready to run against parent page: ${parentId}`);

  const techProjects = await defineTable(
    "Tech projects",
    {
      name: text("Name").title(),
      prdFeatures: relation("PRD features"),
      techStories: relation("Tech stories"),
    },
    { databaseId: "28a91127-9aed-80e7-b422-dba015a2e9c4" }
  );

  const prdFeatures = await defineTable(
    "PRD features",
    {
      name: text("Name").title(),
      techStories: relation("Tech stories"),
      projects: relation("Projects"),
      status: select("Status"),
    },
    { databaseId: "28a911279aed805499abf8d95f98b029" }
  );

  const techStories = await defineTable(
    "Tech stories",
    {
      name: text("Name").title(),
      prdFeatures: relation("PRD features"),
      techProjects: relation("Tech projects"),
      tags: multiSelect("Tags"),
      status: select("Status"),
      techTodos: relation("Tech todos"),
    },
    { databaseId: "28a911279aed807cb87ce0ec448884e5" }
  );

  const techTodos = await defineTable(
    "Tech todos",
    {
      name: text("Name").title(),
      status: status("Status"),
      techStories: relation("Tech stories"),
      select: select("Select"),
      definitionOfDone: text("Definition of done"),
    },
    { databaseId: "28a911279aed802aa1c1d8b48a5a9b77" }
  );

  const projectSelection = await techProjects.select();
  const featureSelection = await prdFeatures.select();
  const storySelection = await techStories.select();
  await techTodos.select();

  log(`Tech projects: ${projectSelection.rows.length} records`);
  log(`PRD features: ${featureSelection.rows.length} records`);
  if (storySelection.rows[0]) {
    log(`First tech story page handle id: ${storySelection.rows[0].notionPage.id}`);
  }
  log(JSON.stringify(storySelection.rows, null, 2));
}

main().catch((error) => {
  logError(`Playground failed: ${(error as Error).message}`);
  process.exit(1);
});
