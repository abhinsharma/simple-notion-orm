/**
 * Playground validation batches:
 * B1 (value + column builders):
 *   - ✅ buildRichTextProperty / buildRichTextColumn
 *   - ✅ buildNumberProperty / buildNumberColumn
 *   - ✅ buildDateProperty / buildDateColumn
 *   - ✅ buildCheckboxProperty / buildCheckboxColumn
 * B2 (value + column builders):
 *   - ✅ buildUrlProperty / buildUrlColumn
 *   - ✅ buildSelectProperty / buildSelectColumn
 *   - ✅ buildMultiSelectProperty / buildMultiSelectColumn
 *   - ✅ buildEmailProperty / buildEmailColumn
 * B3 (value + column builders):
 *   - ✅ buildPhoneNumberProperty / buildPhoneNumberColumn
 *   - ✅ buildPeopleProperty / buildPeopleColumn
 *   - ✅ buildFilesProperty / buildFilesColumn
 *   - ✅ buildRelationProperty / buildRelationColumn
 * B4 (column builders only – Notion manages values automatically):
 *   - ✅ buildRollupColumn
 *   - ✅ buildFormulaColumn
 *   - ✅ buildUniqueIdColumn
 *   - ✅ buildButtonColumn
 * B5 (system columns – column builders only):
 *   - ✅ buildCreatedByColumn
 *   - ✅ buildCreatedTimeColumn
 *   - ✅ buildLastEditedByColumn
 *   - ✅ buildLastEditedTimeColumn
 * B6 (workspace metadata columns – column builders only):
 *   - ✅ buildVerificationColumn
 *   - ✅ buildLocationColumn
 *   - ✅ buildLastVisitedTimeColumn
 *   - ✅ buildPlaceColumn
 * Notes: status columns must be provisioned manually before using builders. Always reset the
 * playground after experiments and keep sandbox data clean.
 * Use a dedicated sandbox page/database, and reset this file after experiments.
 */
import "dotenv/config";

// Batch 5 & 6 columns require manual verification in Notion UI.
// No automated playground run for these metadata columns.

