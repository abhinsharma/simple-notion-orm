/**
 * Database API
 * API for managing Notion databases and database pages (items)
 */
import type { DatabaseResource } from "@/utils/database";
import { wrapError } from "@/utils/error";
import { isFullDatabase, isFullDataSource, type Client } from "@notionhq/client";
import type {
  CreateDatabaseParameters,
  CreateDataSourceParameters,
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

async function retrieveDatabase(databaseId: string, client?: Client): Promise<DatabaseObjectResponse> {
  const notionClient = client ?? getNotionClient();
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
    throw new Error(`Database ${database.id} has no associated data sources. Ensure the workspace has migrated to data sources.`);
  }

  return primaryDataSource.id;
}

async function retrieveDataSource(dataSourceId: string, client?: Client): Promise<DataSourceObjectResponse> {
  const notionClient = client ?? getNotionClient();
  const response = await notionClient.dataSources.retrieve({
    data_source_id: dataSourceId,
  });

  if ((response as DataSourceObjectResponse).object !== "data_source") {
    throw new Error(`Received unexpected response when fetching data source ${dataSourceId}`);
  }

  return response as DataSourceObjectResponse;
}

async function loadDatabaseResource(databaseId: string, client?: Client): Promise<DatabaseResource> {
  const database = await retrieveDatabase(databaseId, client);
  const dataSourceId = getPrimaryDataSourceId(database);
  const dataSource = await retrieveDataSource(dataSourceId, client);

  return {
    database,
    dataSource,
  };
}

/**
 * Retrieve a data source by its ID
 */
export async function getDataSource(dataSourceId: string, client?: Client): Promise<DataSourceObjectResponse> {
  try {
    return await retrieveDataSource(dataSourceId, client);
  } catch (error) {
    throw wrapError(`Failed to retrieve data source ${dataSourceId}`, error);
  }
}

/**
 * Add a data source to an existing database
 */
type CreateDataSourceParams = {
  databaseId: string;
  properties: CreateDataSourceParameters["properties"];
  title?: CreateDataSourceParameters["title"];
  icon?: CreateDataSourceParameters["icon"];
};

export async function createDataSource({ databaseId, properties, title, icon }: CreateDataSourceParams, client?: Client): Promise<DataSourceObjectResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.dataSources.create({
      parent: { type: "database_id", database_id: databaseId },
      properties,
      ...(title ? { title } : {}),
      ...(icon !== undefined ? { icon } : {}),
    });

    return isFullDataSource(response) ? response : await retrieveDataSource(response.id, client);
  } catch (error) {
    throw wrapError(`Failed to create data source in database ${databaseId}`, error);
  }
}

/**
 * Update a single data source. Use this for databases with more than one data source.
 */
type UpdateDataSourceParams = {
  dataSourceId: string;
  title?: UpdateDataSourceParameters["title"];
  icon?: UpdateDataSourceParameters["icon"];
  properties?: UpdateDataSourceParameters["properties"];
  inTrash?: boolean;
};

export async function updateDataSource(
  { dataSourceId, title, icon, properties, inTrash }: UpdateDataSourceParams,
  client?: Client
): Promise<DataSourceObjectResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    await notionClient.dataSources.update({
      data_source_id: dataSourceId,
      ...(title ? { title } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(properties ? { properties } : {}),
      ...(typeof inTrash === "boolean" ? { in_trash: inTrash } : {}),
    });

    return await retrieveDataSource(dataSourceId, client);
  } catch (error) {
    throw wrapError(`Failed to update data source ${dataSourceId}`, error);
  }
}

/**
 * Retrieve a database by its ID
 */
export async function getDatabase(databaseId: string, client?: Client): Promise<DatabaseResource> {
  try {
    return await loadDatabaseResource(databaseId, client);
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

export async function createDatabase(
  { parentId, title, properties, isInline = false, description, icon, cover }: CreateDatabaseParams,
  client?: Client
): Promise<DatabaseResource> {
  try {
    const notionClient = client ?? getNotionClient();
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
    const dataSource = await retrieveDataSource(dataSourceId, client);

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

export async function updateDatabase(
  { databaseId, title, description, isInline, icon, cover, properties }: UpdateDatabaseParams,
  client?: Client
): Promise<DatabaseResource> {
  try {
    const notionClient = client ?? getNotionClient();
    const database = await retrieveDatabase(databaseId, client);
    const dataSourceId = getPrimaryDataSourceId(database);

    const shouldUpdateDatabase = Boolean(title) || Boolean(description) || typeof isInline === "boolean" || icon !== undefined || cover !== undefined;

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

    const shouldUpdateDataSource = Boolean(properties) || Boolean(title) || icon !== undefined;

    if (shouldUpdateDataSource) {
      await notionClient.dataSources.update({
        data_source_id: dataSourceId,
        ...(title && { title }),
        ...(icon !== undefined && { icon }),
        ...(properties && {
          properties: properties as NonNullable<UpdateDataSourceParameters["properties"]>,
        }),
      });
    }

    return await loadDatabaseResource(databaseId, client);
  } catch (error) {
    throw wrapError(`Failed to update database ${databaseId}`, error);
  }
}

async function setDatabaseTrashState(databaseId: string, inTrash: boolean, client?: Client): Promise<DatabaseObjectResponse> {
  const notionClient = client ?? getNotionClient();
  const response = await notionClient.databases.update({
    database_id: databaseId,
    in_trash: inTrash,
  });

  return isFullDatabase(response) ? response : await retrieveDatabase(databaseId, client);
}

/**
 * Move a database to the trash
 */
export async function archiveDatabase(databaseId: string, client?: Client): Promise<DatabaseObjectResponse> {
  try {
    return await setDatabaseTrashState(databaseId, true, client);
  } catch (error) {
    throw wrapError(`Failed to archive database ${databaseId}`, error);
  }
}

/**
 * Restore a database from the trash
 */
export async function restoreDatabase(databaseId: string, client?: Client): Promise<DatabaseObjectResponse> {
  try {
    return await setDatabaseTrashState(databaseId, false, client);
  } catch (error) {
    throw wrapError(`Failed to restore database ${databaseId}`, error);
  }
}

/**
 * Query database items (pages within the database)
 */
export async function queryDataSource(
  dataSourceId: string,
  params?: Omit<QueryDataSourceParameters, "data_source_id">,
  client?: Client
): Promise<QueryDataSourceResponse> {
  try {
    const notionClient = client ?? getNotionClient();
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
  params?: Omit<QueryDataSourceParameters, "data_source_id">,
  client?: Client
): Promise<QueryDataSourceResponse> {
  try {
    const database = await retrieveDatabase(databaseId, client);
    const dataSourceId = getPrimaryDataSourceId(database);

    return await queryDataSource(dataSourceId, params, client);
  } catch (error) {
    throw wrapError(`Failed to query database ${databaseId}`, error);
  }
}

/**
 * Search for databases by title
 */
export async function searchDatabases(query: string, client?: Client): Promise<SearchResponse> {
  try {
    const notionClient = client ?? getNotionClient();
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
