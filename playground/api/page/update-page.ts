import "dotenv/config";
import { updatePage } from "@/api/page";
import { buildTitleProperty } from "@/factories/properties";

const pageId = process.argv[2]!;
const result = await updatePage({
  pageId,
  properties: {
    title: buildTitleProperty(`Updated via playground ${new Date().toISOString()}`),
  },
});

const titleProperty = result.properties.title;
const updatedTitleBlocks =
  titleProperty?.type === "title" ? titleProperty.title.length : 0;

console.dir({ pageId: result.id, updatedTitleBlocks });
