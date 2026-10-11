/**
 * Page API
 * Here api is shaped for non database pages to reduce complexity.
 */
import { appendBlockChildren, deleteBlock, getBlockChildren, type AppendBlockChildrenOptions } from "@/api/block";
import { isFullPage, type Client } from "@notionhq/client";
import type {
  AppendBlockChildrenParameters,
  CreatePageParameters,
  PageObjectResponse,
  SearchResponse,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints.js";
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
  /** Move the page to the trash (`true`) or restore it (`false`). */
  inTrash?: boolean;
  /** @deprecated Use `inTrash`. API version 2026-03-11 renamed `archived` to `in_trash`. */
  archived?: boolean;
  append?: {
    children: AppendBlockChildrenParameters["children"];
  } & AppendBlockChildrenOptions;
};
export async function updatePage(
  { pageId, properties, icon, cover, inTrash, archived, append }: UpdatePageParams,
  client?: Client
): Promise<PageObjectResponse> {
  try {
    if (append) {
      await appendBlockChildren(pageId, append.children, { after: append.after, position: append.position }, client);
    }

    const trashState = inTrash ?? archived;
    const hasUpdate = Boolean(properties || icon !== undefined || cover !== undefined || typeof trashState === "boolean");
    if (!hasUpdate) {
      return await getPage(pageId, undefined, client);
    }

    const notionClient = client ?? getNotionClient();
    const response = await notionClient.pages.update({
      page_id: pageId,
      ...(properties ? { properties } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(cover !== undefined ? { cover } : {}),
      ...(typeof trashState === "boolean" ? { in_trash: trashState } : {}),
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
    return await updatePage({ pageId, inTrash: true }, client);
  } catch (error) {
    throw wrapError(`Failed to archive page ${pageId}`, error);
  }
}

/**
 * Restore an archived page
 */
export async function restorePage(pageId: string, client?: Client): Promise<PageObjectResponse> {
  try {
    return await updatePage({ pageId, inTrash: false }, client);
  } catch (error) {
    throw wrapError(`Failed to restore page ${pageId}`, error);
  }
}

/**
 * Move a page under another page or into a data source
 */
type MovePageParams = {
  pageId: string;
  parent: { pageId: string } | { dataSourceId: string };
};

export async function movePage({ pageId, parent }: MovePageParams, client?: Client): Promise<PageObjectResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.pages.move({
      page_id: pageId,
      parent: "pageId" in parent ? { type: "page_id", page_id: parent.pageId } : { type: "data_source_id", data_source_id: parent.dataSourceId },
    });
    return isFullPage(response) ? response : await getPage(pageId, undefined, client);
  } catch (error) {
    throw wrapError(`Failed to move page ${pageId}`, error);
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
