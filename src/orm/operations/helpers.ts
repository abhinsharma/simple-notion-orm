import type { TableDef, TableHandle, RowEnvelope } from "@/orm/schema/types";
import { decodeRow } from "@/orm/schema/utils";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";

export function ensureTableIds<TDef extends TableDef>(table: TableHandle<TDef>): { databaseId: string; dataSourceId: string } {
  const ids = table.getIds();
  if (!ids.databaseId || !ids.dataSourceId) {
    throw new Error(`Table "${table.title}" is not attached to a database. Ensure it has been created or attached.`);
  }

  return {
    databaseId: ids.databaseId,
    dataSourceId: ids.dataSourceId,
  };
}

export function buildRowEnvelope<TDef extends TableDef>(table: TableHandle<TDef>, page: PageObjectResponse): RowEnvelope<TDef> {
  return {
    data: decodeRow(table.columns, page),
    page,
  };
}
