import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";

// Phase I placeholder types. These will be replaced with the structured
// representations described in docs/transform-blocks.md during Phase III.
export type SimpleBlock = BlockObjectResponse & { children?: SimpleBlock[] };

export function toSimpleBlock(block: BlockObjectResponse): SimpleBlock {
  return block as SimpleBlock;
}

export function toSimpleBlocks(blocks: BlockObjectResponse[]): SimpleBlock[] {
  return blocks.map(toSimpleBlock);
}
