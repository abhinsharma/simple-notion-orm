import { updateDatabasePage } from "@/api/database-page";
import type { TableDef, TableHandle, RowPatch, RowEnvelope, UpdateOptions } from "@/orm/schema/types";
import { buildUpdateProperties } from "@/orm/schema/utils";
import type { PageObjectResponse, UpdatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { ensureTableIds, buildRowEnvelope } from "./helpers";
import { selectRows } from "./select";

const MAX_PAGE_SIZE = 100;

function determineUpdateMode<TDef extends TableDef>(options?: UpdateOptions<TDef>): "single" | "many" {
  if (options?.many) {
    return "many";
  }
  if (options?.pageIds && options.pageIds.length > 1) {
    return "many";
  }
  return "single";
}

async function resolveTargets<TDef extends TableDef>(table: TableHandle<TDef>, options: UpdateOptions<TDef> | undefined, limit: number): Promise<string[]> {
  if (options?.pageIds?.length) {
    return options.pageIds;
  }

  const selection = await selectRows(table, {
    where: options?.where,
    orderBy: options?.orderBy,
    rawFilter: options?.rawFilter,
    rawSorts: options?.rawSorts,
    pageSize: limit,
    startCursor: options?.startCursor,
  });

  return selection.rows.map((row) => row.page.id);
}

export function updateRows<TDef extends TableDef>(
  table: TableHandle<TDef>,
  patch: RowPatch<TDef>,
  options?: UpdateOptions<TDef> & { many?: false }
): Promise<RowEnvelope<TDef>>;
export function updateRows<TDef extends TableDef>(
  table: TableHandle<TDef>,
  patch: RowPatch<TDef>,
  options: UpdateOptions<TDef> & { many: true }
): Promise<Array<RowEnvelope<TDef>>>;
export function updateRows<TDef extends TableDef>(
  table: TableHandle<TDef>,
  patch: RowPatch<TDef>,
  options?: UpdateOptions<TDef>
): Promise<RowEnvelope<TDef> | Array<RowEnvelope<TDef>>>;
export async function updateRows<TDef extends TableDef>(
  table: TableHandle<TDef>,
  patch: RowPatch<TDef>,
  options?: UpdateOptions<TDef>
): Promise<RowEnvelope<TDef> | Array<RowEnvelope<TDef>>> {
  ensureTableIds(table);
  const client = table.getClient();
  const properties = buildUpdateProperties(table.columns, patch);
  const mode = determineUpdateMode(options);
  const limit = options?.pageSize ?? (mode === "many" ? MAX_PAGE_SIZE : 1);
  const targetPageIds = await resolveTargets(table, options, limit);

  if (!targetPageIds.length) {
    throw new Error("No pages matched the update criteria.");
  }

  const results: Array<RowEnvelope<TDef>> = [];
  const pageIdsToUpdate = mode === "many" ? targetPageIds : targetPageIds.slice(0, 1);

  for (const pageId of pageIdsToUpdate) {
    const page = await updateDatabasePage(
      {
        pageId,
        properties: properties as UpdatePageParameters["properties"],
      },
      client
    );
    results.push(buildRowEnvelope(table, page as PageObjectResponse));
  }

  return mode === "many" ? results : results[0]!;
}
