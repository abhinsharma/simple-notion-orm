/**
 * Playground validation batches:
 * B1 (value + column builders):
 *   - buildRichTextProperty / buildRichTextColumn
 *   - buildNumberProperty / buildNumberColumn
 *   - buildDateProperty / buildDateColumn
 *   - buildCheckboxProperty / buildCheckboxColumn
 * B2 (value + column builders):
 *   - buildUrlProperty / buildUrlColumn
 *   - buildSelectProperty / buildSelectColumn
 *   - buildMultiSelectProperty / buildMultiSelectColumn
 *   - buildEmailProperty / buildEmailColumn
 * B3 (value + column builders):
 *   - buildPhoneNumberProperty / buildPhoneNumberColumn
 *   - buildPeopleProperty / buildPeopleColumn
 *   - buildFilesProperty / buildFilesColumn
 *   - buildRelationProperty / buildRelationColumn
 * B4 (column builders only – Notion manages values automatically):
 *   - buildRollupColumn
 *   - buildFormulaColumn
 *   - buildUniqueIdColumn
 *   - buildButtonColumn
 * B5 (system columns – column builders only):
 *   - buildCreatedByColumn
 *   - buildCreatedTimeColumn
 *   - buildLastEditedByColumn
 *   - buildLastEditedTimeColumn
 * B6 (workspace metadata columns – column builders only):
 *   - buildVerificationColumn
 *   - buildLocationColumn
 *   - buildLastVisitedTimeColumn
 *   - buildPlaceColumn
 * Notes: status columns must be provisioned manually before using builders. Always reset the
 * playground after experiments and keep sandbox data clean.
 * Use a dedicated sandbox page/database, and reset this file after experiments.
 */
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
