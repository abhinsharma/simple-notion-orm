import "dotenv/config";
import { updatePage } from "../src/api/page";

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
      title: [
        {
          type: "text",
          text: { content: `Updated via playground ${new Date().toISOString()}` },
        },
      ],
    },
  });

  console.dir(
    {
      pageId: result.id,
      updatedTitleBlocks: result.properties.title?.length ?? 0,
    },
    { depth: 2 }
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
