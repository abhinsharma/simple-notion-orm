/**
 * Page API
 * Here api is shaped for non database pages to reduce complexity.
 */
import { appendBlockChildren, deleteBlock, getBlockChildren } from "@/api/block";
import type { Client } from "@notionhq/client";
import type {
  AppendBlockChildrenParameters,
  CreatePageParameters,
  PageObjectResponse,
  SearchResponse,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { wrapError } from "../utils/error";
import { getNotionClient } from "./client";

/**
 * Retrieve a page by its ID
 */
export async function getPage(pageId: string, filterProperties?: string[], client?: Client): Promise<PageObjectResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.pages.retrieve({
      page_id: pageId,
      filter_properties: filterProperties,
    });
    if (!("properties" in response)) {
      throw new Error(`Retrieve page ${pageId} returned a partial page response`);
    }
    return response;
  } catch (error) {
    throw wrapError(`Failed to retrieve page ${pageId}`, error);
  }
}

/**
 * Create a new page
 * Dont support icon or cover for now
 */
type CreatePageParams = {
  parentId: string;
  properties: CreatePageParameters["properties"];
  children?: CreatePageParameters["children"];
  icon?: CreatePageParameters["icon"];
  cover?: CreatePageParameters["cover"];
};
export async function createPage({ parentId, properties, children, icon, cover }: CreatePageParams, client?: Client): Promise<PageObjectResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.pages.create({
      parent: {
        page_id: parentId,
      },
      properties,
      ...(children ? { children } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(cover !== undefined ? { cover } : {}),
    });
    if (!("properties" in response)) {
      throw new Error("Create page request returned a partial page response");
    }
    return response;
  } catch (error) {
    throw wrapError("Failed to create page", error);
  }
}

/**
 * Update an existing page
 */
type UpdatePageParams = {
  pageId: string;
  properties?: UpdatePageParameters["properties"];
  icon?: UpdatePageParameters["icon"];
  cover?: UpdatePageParameters["cover"];
  archived?: boolean;
  append?: {
    children: AppendBlockChildrenParameters["children"];
    after?: string;
  };
};
export async function updatePage({ pageId, properties, icon, cover, archived, append }: UpdatePageParams, client?: Client): Promise<PageObjectResponse> {
  try {
    if (append) {
      await appendBlockChildren(pageId, append.children, append.after ? { after: append.after } : undefined, client);
    }

    const hasUpdate = Boolean(properties || icon !== undefined || cover !== undefined || typeof archived === "boolean");
    if (!hasUpdate) {
      return await getPage(pageId, undefined, client);
    }

    const notionClient = client ?? getNotionClient();
    const response = await notionClient.pages.update({
      page_id: pageId,
      ...(properties ? { properties } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(cover !== undefined ? { cover } : {}),
      ...(typeof archived === "boolean" ? { archived } : {}),
    });
    if (!("properties" in response)) {
      throw new Error(`Update page request for ${pageId} returned a partial page response`);
    }
    return response;
  } catch (error) {
    throw wrapError(`Failed to update page ${pageId}`, error);
  }
}

/**
 * Archive/delete a page (Notion doesn't have true deletion, only archiving)
 */
export async function archivePage(pageId: string, client?: Client): Promise<PageObjectResponse> {
  try {
    return await updatePage({ pageId, archived: true }, client);
  } catch (error) {
    throw wrapError(`Failed to archive page ${pageId}`, error);
  }
}

/**
 * Restore an archived page
 */
export async function restorePage(pageId: string, client?: Client): Promise<PageObjectResponse> {
  try {
    return await updatePage({ pageId, archived: false }, client);
  } catch (error) {
    throw wrapError(`Failed to restore page ${pageId}`, error);
  }
}

/**
 * Search for pages by title
 */
export async function searchPages(query: string, client?: Client): Promise<SearchResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.search({
      query,
      filter: {
        property: "object",
        value: "page",
      },
    });
    return response;
  } catch (error) {
    throw wrapError(`Failed to search pages with query "${query}"`, error);
  }
}

/**
 * Remove all blocks (content) from a page
 */
export async function clearPageContent(pageId: string, client?: Client): Promise<void> {
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
