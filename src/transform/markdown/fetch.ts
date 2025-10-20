import { getBlockChildren } from "@/api/block";
import type { ListBlockChildrenParameters } from "@notionhq/client/build/src/api-endpoints";
import type { BlockNode } from "./types";

async function collectChildren(blockId: string, params?: Omit<ListBlockChildrenParameters, "block_id">): Promise<BlockNode[]> {
  const nodes: BlockNode[] = [];
  let cursor = params?.start_cursor;

  do {
    const response = await getBlockChildren(blockId, cursor ? { start_cursor: cursor } : undefined);
    const blocks = response.results.filter((item): item is BlockNode => item.object === "block");

    for (const block of blocks) {
      const node: BlockNode = { ...block };

      if (block.type === "synced_block" && block.synced_block.synced_from) {
        node.children = await collectChildren(block.synced_block.synced_from.block_id);
      } else if ("has_children" in block && block.has_children) {
        node.children = await collectChildren(block.id);
      }

      nodes.push(node);
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return nodes;
}

export async function loadBlockTree(rootId: string): Promise<BlockNode[]> {
  return collectChildren(rootId);
}

