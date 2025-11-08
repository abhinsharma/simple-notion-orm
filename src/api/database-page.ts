/**
 * Database Page API
 * API for managing pages/items within Notion databases
 */
import { deleteBlock, getBlockChildren } from "@/api/block";
import type {
  CreatePageParameters,
  CreatePageResponse,
  GetPageResponse,
  PageObjectResponse,
  UpdatePageParameters,
  UpdatePageResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { wrapError } from "../utils/error";
import { getNotionClient } from "./client";

/**
 * Get a database page by ID
 */
export async function getDatabasePage(pageId: string): Promise<GetPageResponse> {
  try {
    const notionClient = getNotionClient();
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
type CreateDatabasePageParams = {
  databaseId: string;
  properties: CreatePageParameters["properties"];
  children?: CreatePageParameters["children"];
  icon?: CreatePageParameters["icon"];
  cover?: CreatePageParameters["cover"];
};

export async function createDatabasePage({ databaseId, properties, children, icon, cover }: CreateDatabasePageParams): Promise<CreatePageResponse> {
  try {
    const notionClient = getNotionClient();
    const response = await notionClient.pages.create({
      parent: {
        database_id: databaseId,
      },
      properties,
      ...(children ? { children } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(cover !== undefined ? { cover } : {}),
    });
    return response as PageObjectResponse;
  } catch (error) {
    throw wrapError(`Failed to create page in database ${databaseId}`, error);
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
  archived?: boolean;
};

export async function updateDatabasePage({ pageId, properties, icon, cover, archived }: UpdateDatabasePageParams): Promise<UpdatePageResponse> {
  try {
    const notionClient = getNotionClient();
    const response = await notionClient.pages.update({
      page_id: pageId,
      ...(properties ? { properties } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(cover !== undefined ? { cover } : {}),
      ...(typeof archived === "boolean" ? { archived } : {}),
    });
    return response as PageObjectResponse;
  } catch (error) {
    throw wrapError(`Failed to update database page ${pageId}`, error);
  }
}

/**
 * Archive a database page/item
 */
export async function archiveDatabasePage(pageId: string): Promise<UpdatePageResponse> {
  try {
    return await updateDatabasePage({ pageId, archived: true });
  } catch (error) {
    throw wrapError(`Failed to archive database page ${pageId}`, error);
  }
}

/**
 * Restore an archived database page/item
 */
export async function restoreDatabasePage(pageId: string): Promise<UpdatePageResponse> {
  try {
    return await updateDatabasePage({ pageId, archived: false });
  } catch (error) {
    throw wrapError(`Failed to restore database page ${pageId}`, error);
  }
}

/**
 * Remove all blocks (content) from a database page
 */
export async function clearDatabasePageContent(pageId: string): Promise<void> {
  let cursor: string | undefined;

  do {
    const response = await getBlockChildren(pageId, cursor ? { start_cursor: cursor } : undefined);
    if (!response.results.length) {
      break;
    }

    for (const block of response.results) {
      await deleteBlock(block.id);
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);
}
