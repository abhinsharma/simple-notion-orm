import { updatePage } from "@/api/page";
import { buildTitleProperty } from "@/factories/properties";
import "dotenv/config";

async function main(): Promise<void> {
  const pageId = process.argv[2]!;
  const result = await updatePage({
    pageId,
    properties: {
      title: buildTitleProperty(
        `Updated via playground ${new Date().toISOString()}`
      ),
    },
  });

  const titleProperty = result.properties.title;
  const updatedTitleBlocks =
    titleProperty?.type === "title" ? titleProperty.title.length : 0;

  console.dir({ pageId: result.id, updatedTitleBlocks });
}

main();
