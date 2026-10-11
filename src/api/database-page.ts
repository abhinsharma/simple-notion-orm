/**
 * Database Page API
 * API for managing pages/items within Notion databases
 */
import { appendBlockChildren, deleteBlock, getBlockChildren, type AppendBlockChildrenOptions } from "@/api/block";
import type { Client } from "@notionhq/client";
import type {
  AppendBlockChildrenParameters,
  CreatePageParameters,
  CreatePageResponse,
  GetPageResponse,
  PageObjectResponse,
  UpdatePageParameters,
  UpdatePageResponse,
} from "@notionhq/client/build/src/api-endpoints.js";
import { wrapError } from "../utils/error";
import { getNotionClient } from "./client";

/**
 * Get a database page by ID
 */
export async function getDatabasePage(pageId: string, client?: Client): Promise<GetPageResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.pages.retrieve({
      page_id: pageId,
    });
    return response as PageObjectResponse;
  } catch (error) {
    throw wrapError(`Failed to retrieve database page ${pageId}`, error);
  }
}

/**
 * Create a new page/item in a database
 */
type CreateDatabasePageTarget =
  | { databaseId: string; dataSourceId?: undefined }
  /** Preferred target. Required for databases with more than one data source. */
  | { dataSourceId: string; databaseId?: undefined };

type CreateDatabasePageParams = CreateDatabasePageTarget & {
  properties: CreatePageParameters["properties"];
  children?: CreatePageParameters["children"];
  icon?: CreatePageParameters["icon"];
  cover?: CreatePageParameters["cover"];
};

export async function createDatabasePage(
  { databaseId, dataSourceId, properties, children, icon, cover }: CreateDatabasePageParams,
  client?: Client
): Promise<CreatePageResponse> {
  const target = dataSourceId ? `data source ${dataSourceId}` : `database ${databaseId}`;
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.pages.create({
      parent: dataSourceId ? { type: "data_source_id", data_source_id: dataSourceId } : { type: "database_id", database_id: databaseId! },
      properties,
      ...(children ? { children } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(cover !== undefined ? { cover } : {}),
    });
    return response as PageObjectResponse;
  } catch (error) {
    throw wrapError(`Failed to create page in ${target}`, error);
  }
}

/**
 * Update a database page/item
 */
type UpdateDatabasePageParams = {
  pageId: string;
  properties?: UpdatePageParameters["properties"];
  icon?: UpdatePageParameters["icon"];
  cover?: UpdatePageParameters["cover"];
  /** Move the page to the trash (`true`) or restore it (`false`). */
  inTrash?: boolean;
  /** @deprecated Use `inTrash`. API version 2026-03-11 renamed `archived` to `in_trash`. */
  archived?: boolean;
  append?: {
    children: AppendBlockChildrenParameters["children"];
  } & AppendBlockChildrenOptions;
};

export async function updateDatabasePage(
  { pageId, properties, icon, cover, inTrash, archived, append }: UpdateDatabasePageParams,
  client?: Client
): Promise<UpdatePageResponse> {
  try {
    if (append) {
      await appendBlockChildren(pageId, append.children, { after: append.after, position: append.position }, client);
    }

    const trashState = inTrash ?? archived;
    const hasUpdate = Boolean(properties || icon !== undefined || cover !== undefined || typeof trashState === "boolean");
    if (!hasUpdate) {
      return (await getDatabasePage(pageId, client)) as UpdatePageResponse;
    }

    const notionClient = client ?? getNotionClient();
    const response = await notionClient.pages.update({
      page_id: pageId,
      ...(properties ? { properties } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(cover !== undefined ? { cover } : {}),
      ...(typeof trashState === "boolean" ? { in_trash: trashState } : {}),
    });
    return response as PageObjectResponse;
  } catch (error) {
    throw wrapError(`Failed to update database page ${pageId}`, error);
  }
}

/**
 * Archive a database page/item
 */
export async function archiveDatabasePage(pageId: string, client?: Client): Promise<UpdatePageResponse> {
  try {
    return await updateDatabasePage({ pageId, inTrash: true }, client);
  } catch (error) {
    throw wrapError(`Failed to archive database page ${pageId}`, error);
  }
}

/**
 * Restore an archived database page/item
 */
export async function restoreDatabasePage(pageId: string, client?: Client): Promise<UpdatePageResponse> {
  try {
    return await updateDatabasePage({ pageId, inTrash: false }, client);
  } catch (error) {
    throw wrapError(`Failed to restore database page ${pageId}`, error);
  }
}

/**
 * Remove all blocks (content) from a database page
 */
export async function clearDatabasePageContent(pageId: string, client?: Client): Promise<void> {
  let cursor: string | undefined;

  do {
    const response = await getBlockChildren(pageId, cursor ? { start_cursor: cursor } : undefined, client);
    if (!response.results.length) {
      break;
    }

    for (const block of response.results) {
      await deleteBlock(block.id, client);
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);
}
