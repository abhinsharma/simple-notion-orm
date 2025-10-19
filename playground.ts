import "dotenv/config";

import {
  archivePage,
  createPage,
  getPage,
  restorePage,
  searchPages,
  updatePage,
} from "@/api/page";
import { buildTitleProperty } from "@/factories/properties";

const capturePageId = process.env.CAPTURE_PAGE_ID!;

await getPage(capturePageId);

const createdPage = await createPage({
  parentId: capturePageId,
  properties: {
    title: buildTitleProperty(`Playground example ${new Date().toISOString()}`),
  },
});

await updatePage({
  pageId: createdPage.id,
  properties: {
    title: buildTitleProperty(`Updated playground ${new Date().toISOString()}`),
  },
});

await archivePage(createdPage.id);
await restorePage(createdPage.id);
await searchPages("Playground");
