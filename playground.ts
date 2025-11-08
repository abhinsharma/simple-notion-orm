/**
 * Notes: status columns must be provisioned manually before using builders. Always reset the
 * playground after experiments and keep sandbox data clean.
 * Use a dedicated sandbox page/database, and reset this file after experiments.
 */
import { asc, checkbox, contains, defineTable, number, text } from "@/orm";
import "dotenv/config";

async function main() {
  const parentId = process.env.PLAYGROUND_PAGE_ID;
  if (!parentId) {
    console.error("Set PLAYGROUND_PAGE_ID in your .env file to run the playground.");
    return;
  }

  const table = await defineTable(
    `Playground Todos ${new Date().toISOString()}`,
    {
      title: text("Title").title(),
      description: text("Description").optional(),
      done: checkbox("Done").default(false),
      points: number("Points").optional(),
    },
    { parentId }
  );

  console.log("Created playground database:", table.getIds());

  const inserted = await table.insert({
    title: "Test task",
    description: "Inserted via playground",
    points: 3,
    done: false,
  });

  console.log("Inserted row:", inserted.data, "page", inserted.page.id);

  const selection = await table.select({
    pageSize: 10,
    where: contains(table.columns.title, "Test"),
    orderBy: asc(table.columns.title),
  });

  console.log(`Fetched ${selection.rows.length} rows (nextCursor=${selection.nextCursor})`);

  const updated = await table.update(
    { done: true },
    {
      pageIds: [inserted.page.id],
    }
  );

  console.log("Updated row:", updated.data.done ? "completed" : "pending");

  const archived = await table.archive({ pageIds: [inserted.page.id] });
  console.log(`Archived rows: ${archived}`);

  const restored = await table.restore({ pageIds: [inserted.page.id] });
  console.log(`Restored rows: ${restored}`);

  console.log("Playground complete. Remember to clean up the created database.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
