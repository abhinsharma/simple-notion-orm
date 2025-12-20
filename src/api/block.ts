/**
 * Block API
 * Wrapper functions for Notion Block API operations
 */
import type { Client } from "@notionhq/client";
import type {
  AppendBlockChildrenParameters,
  AppendBlockChildrenResponse,
  DeleteBlockResponse,
  GetBlockResponse,
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
  UpdateBlockParameters,
  UpdateBlockResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { wrapError } from "../utils/error";
import { getNotionClient } from "./client";

/**
 * Retrieve a block by its ID
 */
export async function getBlock(blockId: string, client?: Client): Promise<GetBlockResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.blocks.retrieve({
      block_id: blockId,
    });
    return response;
  } catch (error) {
    throw wrapError(`Failed to retrieve block ${blockId}`, error);
  }
}

/**
 * Retrieve children of a block
 */
export async function getBlockChildren(
  blockId: string,
  params?: Omit<ListBlockChildrenParameters, "block_id">,
  client?: Client
): Promise<ListBlockChildrenResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.blocks.children.list({
      block_id: blockId,
      ...params,
    });
    return response;
  } catch (error) {
    throw wrapError(`Failed to retrieve children of block ${blockId}`, error);
  }
}

/**
 * Append children to a block
 */
export async function appendBlockChildren(
  blockId: string,
  children: AppendBlockChildrenParameters["children"],
  options?: { after?: string },
  client?: Client
): Promise<AppendBlockChildrenResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const payload: AppendBlockChildrenParameters & { after?: string } = {
      block_id: blockId,
      children,
      ...(options?.after ? { after: options.after } : {}),
    };
    const response = await notionClient.blocks.children.append(payload);
    return response;
  } catch (error) {
    throw wrapError(`Failed to append children to block ${blockId}`, error);
  }
}

/**
 * Update a block
 */
type UpdateBlockParams = {
  blockId: string;
} & Omit<UpdateBlockParameters, "block_id">;

export async function updateBlock({ blockId, ...updateParams }: UpdateBlockParams, client?: Client): Promise<UpdateBlockResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.blocks.update({
      block_id: blockId,
      ...updateParams,
    });
    return response;
  } catch (error) {
    throw wrapError(`Failed to update block ${blockId}`, error);
  }
}

/**
 * Delete a block
 */
export async function deleteBlock(blockId: string, client?: Client): Promise<DeleteBlockResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const response = await notionClient.blocks.delete({
      block_id: blockId,
    });
    return response;
  } catch (error) {
    throw wrapError(`Failed to delete block ${blockId}`, error);
  }
}
