/**
 * Block API
 * Wrapper functions for Notion Block API operations
 */
import type { Client } from "@notionhq/client";
import type {
  AppendBlockChildrenParameters,
  ContentPositionSchema,
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

export type AppendPosition = ContentPositionSchema;

export type AppendBlockChildrenOptions = {
  /** Insert after this block. Shorthand for `position: { type: "after_block", after_block: { id } }`. */
  after?: string;
  position?: AppendPosition;
};

/**
 * Resolve append options into the `position` body parameter used by API version 2026-03-11.
 */
export function resolveAppendPosition(options?: AppendBlockChildrenOptions): AppendPosition | undefined {
  if (options?.position) {
    return options.position;
  }
  if (options?.after) {
    return { type: "after_block", after_block: { id: options.after } };
  }
  return undefined;
}

/**
 * Append children to a block
 */
export async function appendBlockChildren(
  blockId: string,
  children: AppendBlockChildrenParameters["children"],
  options?: AppendBlockChildrenOptions,
  client?: Client
): Promise<AppendBlockChildrenResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    const position = resolveAppendPosition(options);
    const response = await notionClient.blocks.children.append({
      block_id: blockId,
      children,
      ...(position ? { position } : {}),
    });
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
