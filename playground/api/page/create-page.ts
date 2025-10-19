import "dotenv/config";
import { createPage } from "@/api/page";
import { buildTitleProperty } from "@/factories/properties";

const parentId = process.env.CAPTURE_PAGE_ID!;
const result = await createPage({
  parentId,
  properties: {
    title: buildTitleProperty(`Playground create ${new Date().toISOString()}`),
  },
});

console.dir({ createdId: result.id, url: result.url });
