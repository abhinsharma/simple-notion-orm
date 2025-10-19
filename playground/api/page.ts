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

const capturedPage = await getPage(capturePageId);
console.dir(capturedPage);

const createdPage = await createPage({
  parentId: capturePageId,
  properties: {
    title: buildTitleProperty(`Playground create ${new Date().toISOString()}`),
  },
});
console.dir(createdPage);

const updatedPage = await updatePage({
  pageId: createdPage.id,
  properties: {
    title: buildTitleProperty(`Updated via playground ${new Date().toISOString()}`),
  },
});
console.dir(updatedPage);

const archivedPage = await archivePage(createdPage.id);
console.dir(archivedPage);

const restoredPage = await restorePage(createdPage.id);
console.dir(restoredPage);

const searchResults = await searchPages("Playground");
console.dir(searchResults);
