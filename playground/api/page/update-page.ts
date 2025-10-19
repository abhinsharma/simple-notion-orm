import "dotenv/config";
import { updatePage } from "@/api/page";
import { buildTitleProperty } from "@/factories/properties";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

async function main(): Promise<void> {
  const pageId = process.argv[2];

  if (!pageId) {
    throw new Error(
      "Pass the page ID you want to update as the first argument. Example: pnpm tsx playground/update-page.ts <PAGE_ID>"
    );
  }

  const result = await updatePage({
    pageId,
    properties: {
      title: buildTitleProperty(`Updated via playground ${new Date().toISOString()}`),
    },
  }) as PageObjectResponse;

  const titleProperty = result.properties.title;
  const updatedTitleBlocks =
    titleProperty?.type === "title" ? titleProperty.title.length : 0;

  console.dir(
    {
      pageId: result.id,
      updatedTitleBlocks,
    },
    { depth: 2 }
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
