import "dotenv/config";
import {
  getPage,
  createPage,
  updatePage,
  archivePage,
  restorePage,
  searchPages,
} from "../src/api/page";

async function main(): Promise<void> {
  const parentId = process.env.CAPTURE_PAGE_ID;

  if (!parentId) {
    throw new Error(
      "CAPTURE_PAGE_ID is not set. Provide a parent page ID in your environment before running the playground."
    );
  }

  console.log("Fetching parent page properties...");
  const parent = await getPage(parentId);
  console.log("Parent page property keys:", Object.keys(parent.properties ?? {}));

  const titleContent = `Playground Example ${new Date().toISOString()}`;

  console.log("Creating a child page...");
  const created = await createPage({
    parentId,
    properties: {
      title: [
        {
          type: "text",
          text: { content: titleContent },
        },
      ],
    },
  });
  console.log("Created page:", created.id);

  console.log("Updating the child page title...");
  const updated = await updatePage({
    pageId: created.id,
    properties: {
      title: [
        {
          type: "text",
          text: { content: `${titleContent} (updated)` },
        },
      ],
    },
  });
  console.log(
    "Updated title blocks:",
    updated.properties.title?.length ?? 0
  );

  console.log("Retrieving updated page...");
  const fetched = await getPage(created.id);
  console.log(
    "Fetched title text:",
    fetched.properties.title?.[0]?.type === "title"
      ? fetched.properties.title[0].plain_text
      : ""
  );

  console.log("Searching for the updated page by keyword...");
  const results = await searchPages(titleContent);
  console.log("Search results:", results.results.length);

  console.log("Archiving the child page...");
  await archivePage(created.id);
  console.log("Page archived.");

  console.log("Restoring the child page...");
  await restorePage(created.id);
  console.log("Page restored.");

  console.log("Cleaning up by archiving again...");
  await archivePage(created.id);
  console.log("Cleanup complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
