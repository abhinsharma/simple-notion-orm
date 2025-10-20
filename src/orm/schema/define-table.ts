import type { ColumnDef, TableHandle } from "./types";

export function defineTable<
  const TColumns extends Record<string, ColumnDef>,
  const TOptions extends { ids?: { databaseId?: string; dataSourceId?: string } } | undefined = undefined,
>(
  title: string,
  columns: TColumns,
  options?: TOptions
): TableHandle<{ title: string; columns: TColumns; ids: TOptions extends { ids: infer I } ? I : undefined }> {
  let cachedIds = options?.ids;

  return {
    title,
    columns,
    getIds: () => cachedIds ?? {},
    cacheIds: (ids) => {
      cachedIds = ids;
    },
  };
}
