/**
 * Test playground for page property factories
 * Testing title property with actual page update
 */

import "dotenv/config";
import { buildTitleProperty } from "@factories/properties/page";
import { updatePage } from "@api/page";

async function main() {
  const pageId = process.env.CAPTURE_PAGE_ID;
  if (!pageId) {
    throw new Error("CAPTURE_PAGE_ID is not set in .env");
  }

  console.log("=== Testing buildTitleProperty with updatePage ===\n");

  const newTitle = `Updated via builder ${new Date().toISOString()}`;
  console.log("New title:", newTitle);

  const result = await updatePage({
    pageId,
    properties: {
      title: buildTitleProperty(newTitle),
    },
  });

  console.log("\n✅ Page updated successfully!");
  console.log("Page ID:", result.id);
  console.log("Page URL:", result.url);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
