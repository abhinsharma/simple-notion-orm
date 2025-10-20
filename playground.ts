/**
 * Notes: status columns must be provisioned manually before using builders. Always reset the
 * playground after experiments and keep sandbox data clean.
 * Use a dedicated sandbox page/database, and reset this file after experiments.
 */
import { defineTable, multiSelect, relation, select, status, text } from "@/orm/schema";
import "dotenv/config";

async function main() {
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

  const projects = await techProjects.select();
  const features = await prdFeatures.select();
  const stories = await techStories.select();
  const _todos = await techTodos.select();

  console.log(`Tech projects: ${projects.length} records`);
  console.log(`PRD features: ${features.length} records`);
  console.dir(stories, { depth: null });
}

main();
