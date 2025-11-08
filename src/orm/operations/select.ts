import { queryDataSource } from "@/api/database";
import type {
  PageObjectResponse,
  QueryDataSourceResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { compileQueryOptions } from "@/orm/query/compiler";
import type { TableDef, TableHandle, SelectOptions, SelectResult } from "@/orm/schema/types";
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

function isPageObject(
  result: QueryDataSourceResponse["results"][number]
): result is PageObjectResponse {
  return result.object === "page" && "properties" in result;
}

export async function selectRows<TDef extends TableDef>(
  table: TableHandle<TDef>,
  options?: SelectOptions<TDef>
): Promise<SelectResult<TDef>> {
  const ids = ensureTableIds(table);
  const pageSize = sanitizePageSize(options?.pageSize ?? DEFAULT_PAGE_SIZE);
  const queryOptions = compileQueryOptions(options);

  const response = await queryDataSource(ids.dataSourceId, {
    ...(queryOptions.filter ? { filter: queryOptions.filter } : {}),
    ...(queryOptions.sorts ? { sorts: queryOptions.sorts } : {}),
    ...(pageSize ? { page_size: pageSize } : {}),
    ...(options?.startCursor ? { start_cursor: options.startCursor } : {}),
  });

  const rows = response.results.filter(isPageObject).map((page) => buildRowEnvelope(table, page));

  return {
    rows,
    nextCursor: response.next_cursor ?? null,
    hasMore: response.has_more ?? Boolean(response.next_cursor),
  };
}
