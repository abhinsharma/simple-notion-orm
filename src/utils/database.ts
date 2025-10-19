import type {
  DataSourceObjectResponse,
  DatabaseObjectResponse,
  PageObjectResponse,
  PartialDatabaseObjectResponse,
  PartialDataSourceObjectResponse,
  PartialPageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

export type DatabaseResource = {
  database: DatabaseObjectResponse;
  dataSource: DataSourceObjectResponse;
};

type QueryResultItem =
  | PageObjectResponse
  | PartialPageObjectResponse
  | PartialDatabaseObjectResponse
  | DatabaseObjectResponse
  | PartialDataSourceObjectResponse
  | DataSourceObjectResponse;

export function isDatabasePageObject(
  item: QueryResultItem
): item is PageObjectResponse {
  return item.object === "page" && "properties" in item;
}

function extractPlainText(
  items?: Array<{
    plain_text: string;
  }>
): string {
  if (!items || !Array.isArray(items)) {
    return "";
  }

  return items.map((item) => item.plain_text).join(" ");
}

export function getDatabaseTitle(database: DatabaseResource): string {
  const title = database.dataSource.title?.length
    ? database.dataSource.title
    : database.database.title;

  return extractPlainText(title);
}

export function getDatabaseDescription(
  database: DatabaseResource
): string | undefined {
  const description = database.dataSource.description?.length
    ? database.dataSource.description
    : database.database.description;

  const text = extractPlainText(description);
  return text || undefined;
}

export function hasDatabaseId<T>(obj: T): obj is T & { databaseId: string } {
  return typeof obj === "object" && obj !== null && "databaseId" in obj;
}
