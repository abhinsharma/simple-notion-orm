import { updateDatabasePage } from "@/api/database-page";
import type { TableDef, TableHandle, TargetOptions } from "@/orm/schema/types";
import { ensureTableIds } from "./helpers";
import { selectRows } from "./select";

const MAX_PAGE_SIZE = 100;

function resolveLimit<TDef extends TableDef>(options?: TargetOptions<TDef>): number {
  if (options?.pageIds?.length) {
    return options.pageIds.length;
  }
  if (options?.pageSize) {
    return Math.min(Math.max(options.pageSize, 1), MAX_PAGE_SIZE);
  }
  return MAX_PAGE_SIZE;
}

async function resolvePageIds<TDef extends TableDef>(
  table: TableHandle<TDef>,
  options?: TargetOptions<TDef>
): Promise<string[]> {
  if (options?.pageIds?.length) {
    return options.pageIds;
  }

  const limit = resolveLimit(options);
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

async function applyArchiveState(
  pageIds: string[],
  archived: boolean
): Promise<number> {
  let count = 0;
  for (const id of pageIds) {
    await updateDatabasePage({
      pageId: id,
      archived,
    });
    count += 1;
  }
  return count;
}

export async function archiveRows<TDef extends TableDef>(
  table: TableHandle<TDef>,
  options?: TargetOptions<TDef>
): Promise<number> {
  ensureTableIds(table);
  const pageIds = await resolvePageIds(table, options);
  if (!pageIds.length) {
    return 0;
  }

  return applyArchiveState(pageIds, true);
}

export async function restoreRows<TDef extends TableDef>(
  table: TableHandle<TDef>,
  options?: TargetOptions<TDef>
): Promise<number> {
  ensureTableIds(table);
  const pageIds = await resolvePageIds(table, options);
  if (!pageIds.length) {
    return 0;
  }

  return applyArchiveState(pageIds, false);
}
