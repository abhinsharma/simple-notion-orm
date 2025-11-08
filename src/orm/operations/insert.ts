import { createDatabasePage } from "@/api/database-page";
import type { TableDef, TableHandle, RowInput, RowEnvelope } from "@/orm/schema/types";
import { buildInsertProperties } from "@/orm/schema/utils";
import type { CreatePageParameters, PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { ensureTableIds, buildRowEnvelope } from "./helpers";

export function insertRows<TDef extends TableDef>(table: TableHandle<TDef>, values: RowInput<TDef>): Promise<RowEnvelope<TDef>>;
export function insertRows<TDef extends TableDef>(table: TableHandle<TDef>, values: Array<RowInput<TDef>>): Promise<Array<RowEnvelope<TDef>>>;
export async function insertRows<TDef extends TableDef>(
  table: TableHandle<TDef>,
  values: RowInput<TDef> | Array<RowInput<TDef>>
): Promise<RowEnvelope<TDef> | Array<RowEnvelope<TDef>>> {
  const rows = Array.isArray(values) ? values : [values];
  const ids = ensureTableIds(table);
  const results: Array<RowEnvelope<TDef>> = [];

  for (const value of rows) {
    const properties = buildInsertProperties(table.columns, value);
    const page = await createDatabasePage({
      databaseId: ids.databaseId,
      properties: properties as CreatePageParameters["properties"],
    });
    results.push(buildRowEnvelope(table, page as PageObjectResponse));
  }

  return Array.isArray(values) ? results : results[0]!;
}
