import { queryDataSource } from "@/api/database";
import { compileQueryOptions } from "@/orm/query/compiler";
import { populateRelations } from "@/orm/relation/populate";
import type { RowEnvelope, SelectAllOptions, TableDef, TableHandle, SelectOptions, SelectResult } from "@/orm/schema/types";
import type { PageObjectResponse, QueryDataSourceResponse } from "@notionhq/client/build/src/api-endpoints.js";
import { ensureTableIds, buildRowEnvelope } from "./helpers";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

function sanitizePageSize(size?: number): number | undefined {
  if (typeof size !== "number") {
    return undefined;
  }
  if (size < 1) {
    return 1;
  }
  return Math.min(size, MAX_PAGE_SIZE);
}

function isPageObject(result: QueryDataSourceResponse["results"][number]): result is PageObjectResponse {
  return result.object === "page" && "properties" in result;
}

export async function selectRows<TDef extends TableDef>(table: TableHandle<TDef>, options?: SelectOptions<TDef>): Promise<SelectResult<TDef>> {
  const ids = ensureTableIds(table);
  const client = table.getClient();
  const pageSize = sanitizePageSize(options?.pageSize ?? DEFAULT_PAGE_SIZE);
  const queryOptions = compileQueryOptions(options);

  const response = await queryDataSource(
    ids.dataSourceId,
    {
      ...(queryOptions.filter ? { filter: queryOptions.filter } : {}),
      ...(queryOptions.sorts ? { sorts: queryOptions.sorts } : {}),
      ...(pageSize ? { page_size: pageSize } : {}),
      ...(options?.startCursor ? { start_cursor: options.startCursor } : {}),
    },
    client
  );

  let rows = response.results.filter(isPageObject).map((page) => buildRowEnvelope(table, page));

  if (options?.populate) {
    rows = (await populateRelations(table, rows, options.populate)) as Array<(typeof rows)[number]>;
  }

  return {
    rows,
    nextCursor: response.next_cursor ?? null,
    hasMore: response.has_more ?? Boolean(response.next_cursor),
  };
}

/**
 * Select every matching row by following pagination cursors. Each request fetches up to 100 rows.
 */
export async function selectAllRows<TDef extends TableDef>(table: TableHandle<TDef>, options?: SelectAllOptions<TDef>): Promise<Array<RowEnvelope<TDef>>> {
  const rows: Array<RowEnvelope<TDef>> = [];
  let startCursor: string | undefined;

  do {
    const page = await selectRows(table, { ...options, pageSize: options?.pageSize ?? MAX_PAGE_SIZE, startCursor });
    rows.push(...page.rows);
    startCursor = page.hasMore && page.nextCursor ? page.nextCursor : undefined;
  } while (startCursor);

  return rows;
}
