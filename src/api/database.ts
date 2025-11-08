/**
 * Database API
 * API for managing Notion databases and database pages (items)
 */
import type { DatabaseResource } from "@/utils/database";
import { wrapError } from "@/utils/error";
import type {
  CreateDatabaseParameters,
  DataSourceObjectResponse,
  DatabaseObjectResponse,
  QueryDataSourceParameters,
  QueryDataSourceResponse,
  SearchResponse,
  UpdateDatabaseParameters,
  UpdateDataSourceParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { getNotionClient } from "./client";

type InitialDataSource = NonNullable<CreateDatabaseParameters["initial_data_source"]>;
type DatabaseProperties = NonNullable<InitialDataSource["properties"]>;

async function retrieveDatabase(
  databaseId: string
): Promise<DatabaseObjectResponse> {
  const notionClient = getNotionClient();
  const response = await notionClient.databases.retrieve({
    database_id: databaseId,
  });

  if ((response as DatabaseObjectResponse).object !== "database") {
    throw new Error(`Received unexpected response when fetching database ${databaseId}`);
  }

  return response as DatabaseObjectResponse;
}

function getPrimaryDataSourceId(database: DatabaseObjectResponse): string {
  const primaryDataSource = database.data_sources?.[0];

  if (!primaryDataSource) {
    throw new Error(
      `Database ${database.id} has no associated data sources. Ensure the workspace has migrated to data sources.`
    );
  }

  return primaryDataSource.id;
}

async function retrieveDataSource(
  dataSourceId: string
): Promise<DataSourceObjectResponse> {
  const notionClient = getNotionClient();
  const response = await notionClient.dataSources.retrieve({
    data_source_id: dataSourceId,
  });

  if ((response as DataSourceObjectResponse).object !== "data_source") {
    throw new Error(
      `Received unexpected response when fetching data source ${dataSourceId}`
    );
  }

  return response as DataSourceObjectResponse;
}

async function loadDatabaseResource(databaseId: string): Promise<DatabaseResource> {
  const database = await retrieveDatabase(databaseId);
  const dataSourceId = getPrimaryDataSourceId(database);
  const dataSource = await retrieveDataSource(dataSourceId);

  return {
    database,
    dataSource,
  };
}

/**
 * Retrieve a database by its ID
 */
export async function getDatabase(
  databaseId: string
): Promise<DatabaseResource> {
  try {
    return await loadDatabaseResource(databaseId);
  } catch (error) {
    throw wrapError(`Failed to retrieve database ${databaseId}`, error);
  }
}

/**
 * Create a new database
 * @param parentId - ID of the parent page where the database will be created
 * @param title - Title of the database
 * @param properties - Database schema properties
 * @param isInline - Whether the database should be displayed inline (default: false)
 */
type CreateDatabaseParams = {
  parentId: string;
  title: CreateDatabaseParameters["title"];
  properties: DatabaseProperties;
  isInline?: boolean;
  description?: CreateDatabaseParameters["description"];
  icon?: CreateDatabaseParameters["icon"];
  cover?: CreateDatabaseParameters["cover"];
};

export async function createDatabase({
  parentId,
  title,
  properties,
  isInline = false,
  description,
  icon,
  cover,
}: CreateDatabaseParams): Promise<DatabaseResource> {
  try {
    const notionClient = getNotionClient();
    const response = await notionClient.databases.create({
      parent: {
        type: "page_id",
        page_id: parentId,
      },
      title,
      description,
      is_inline: isInline,
      initial_data_source: {
        properties,
      },
      icon,
      cover,
    });

    const database = response as DatabaseObjectResponse;
    const dataSourceId = getPrimaryDataSourceId(database);
    const dataSource = await retrieveDataSource(dataSourceId);

    return {
      database,
      dataSource,
    };
  } catch (error) {
    throw wrapError("Failed to create database", error);
  }
}

/**
 * Update an existing database
 */
type UpdateDatabaseParams = {
  databaseId: string;
  title?: UpdateDatabaseParameters["title"];
  description?: UpdateDatabaseParameters["description"];
  isInline?: boolean;
  icon?: UpdateDatabaseParameters["icon"];
  cover?: UpdateDatabaseParameters["cover"];
  properties?: DatabaseProperties;
};

export async function updateDatabase({
  databaseId,
  title,
  description,
  isInline,
  icon,
  cover,
  properties,
}: UpdateDatabaseParams): Promise<DatabaseResource> {
  try {
    const notionClient = getNotionClient();
    const database = await retrieveDatabase(databaseId);
    const dataSourceId = getPrimaryDataSourceId(database);

    const shouldUpdateDatabase =
      Boolean(title) ||
      Boolean(description) ||
      typeof isInline === "boolean" ||
      icon !== undefined ||
      cover !== undefined;

    if (shouldUpdateDatabase) {
      await notionClient.databases.update({
        database_id: databaseId,
        ...(title && { title }),
        ...(description && { description }),
        ...(typeof isInline === "boolean" && { is_inline: isInline }),
        ...(icon !== undefined && { icon }),
        ...(cover !== undefined && { cover }),
      });
    }

    const shouldUpdateDataSource =
      Boolean(properties) || Boolean(title) || icon !== undefined;

    if (shouldUpdateDataSource) {
      await notionClient.dataSources.update({
        data_source_id: dataSourceId,
        ...(title && { title }),
        ...(icon !== undefined && { icon }),
        ...(properties && {
          properties: properties as NonNullable<
            UpdateDataSourceParameters["properties"]
          >,
        }),
      });
    }

    return await loadDatabaseResource(databaseId);
  } catch (error) {
    throw wrapError(`Failed to update database ${databaseId}`, error);
  }
}

/**
 * Query database items (pages within the database)
 */
export async function queryDataSource(
  dataSourceId: string,
  params?: Omit<QueryDataSourceParameters, "data_source_id">
): Promise<QueryDataSourceResponse> {
  try {
    const notionClient = getNotionClient();
    const response = await notionClient.dataSources.query({
      data_source_id: dataSourceId,
      ...params,
    });

    return response;
  } catch (error) {
    throw wrapError(`Failed to query data source ${dataSourceId}`, error);
  }
}

export async function queryDatabase(
  databaseId: string,
  params?: Omit<QueryDataSourceParameters, "data_source_id">
): Promise<QueryDataSourceResponse> {
  try {
    const database = await retrieveDatabase(databaseId);
    const dataSourceId = getPrimaryDataSourceId(database);

    return await queryDataSource(dataSourceId, params);
  } catch (error) {
    throw wrapError(`Failed to query database ${databaseId}`, error);
  }
}

/**
 * Search for databases by title
 */
export async function searchDatabases(query: string): Promise<SearchResponse> {
  try {
    const notionClient = getNotionClient();
    const response = await notionClient.search({
      query,
      filter: {
        property: "object",
        value: "data_source",
      },
    });
    return response;
  } catch (error) {
    throw wrapError(`Failed to search databases with query "${query}"`, error);
  }
}
