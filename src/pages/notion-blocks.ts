import { getBlockChildren } from "@/api/block";
import { toSimpleBlock, toSimpleBlocks, type SimpleBlock } from "@/transform/blocks";
import type { BlockObjectResponse, ListBlockChildrenParameters } from "@notionhq/client/build/src/api-endpoints";

type ListOptions = {
  pageSize?: ListBlockChildrenParameters["page_size"];
  startCursor?: ListBlockChildrenParameters["start_cursor"];
};

type TreeOptions = {
  pageSize?: ListBlockChildrenParameters["page_size"];
  recursive?: boolean;
};

type StreamOptions = {
  pageSize?: ListBlockChildrenParameters["page_size"];
  recursive?: boolean;
};

export type PageBlock = BlockObjectResponse & { children?: PageBlock[] };

function isBlockObject(result: { object: string }): result is BlockObjectResponse {
  return result.object === "block";
}

export class NotionBlocks {
  private constructor(private readonly pageId: string) {}

  static forPage(pageId: string): NotionBlocks {
    return new NotionBlocks(pageId);
  }

  async listRaw(options?: ListOptions): Promise<BlockObjectResponse[]> {
    return this.listChildren(this.pageId, options);
  }

  async list(options?: ListOptions): Promise<SimpleBlock[]> {
    return toSimpleBlocks(await this.listRaw(options));
  }

  async treeRaw(options?: TreeOptions): Promise<PageBlock[]> {
    if (options?.recursive === false) {
      const nodes = await this.listRaw({ pageSize: options?.pageSize });
      return nodes.map((node) => ({ ...node }));
    }

    return this.collectBlockTree(this.pageId, options?.pageSize);
  }

  async tree(options?: TreeOptions): Promise<SimpleBlock[]> {
    const rawTree = await this.treeRaw(options);
    return rawTree.map((block) => this.toSimpleBlockRecursive(block));
  }

  async *streamRaw(options?: StreamOptions): AsyncGenerator<BlockObjectResponse> {
    const recursive = options?.recursive ?? true;
    const stack: string[] = [this.pageId];

    while (stack.length) {
      const current = stack.pop()!;
      let cursor: string | undefined;

      do {
        const response = await getBlockChildren(current, {
          ...(cursor ? { start_cursor: cursor } : {}),
          ...(options?.pageSize ? { page_size: options.pageSize } : {}),
        });

        for (const result of response.results) {
          if (!isBlockObject(result)) {
            continue;
          }

          yield result;

          if (!recursive) {
            continue;
          }

          if (result.type === "synced_block" && result.synced_block.synced_from) {
            stack.push(result.synced_block.synced_from.block_id);
          } else if ("has_children" in result && result.has_children) {
            stack.push(result.id);
          }
        }

        cursor = response.next_cursor ?? undefined;
      } while (cursor);
    }
  }

  async *stream(options?: StreamOptions): AsyncGenerator<SimpleBlock> {
    for await (const block of this.streamRaw(options)) {
      yield toSimpleBlock(block);
    }
  }

  private async listChildren(blockId: string, options?: ListOptions): Promise<PageBlock[]> {
    const nodes: PageBlock[] = [];
    let cursor = options?.startCursor;

    do {
      const response = await getBlockChildren(blockId, {
        ...(cursor ? { start_cursor: cursor } : {}),
        ...(options?.pageSize ? { page_size: options.pageSize } : {}),
      });

      for (const item of response.results) {
        if (isBlockObject(item)) {
          nodes.push({ ...item } as PageBlock);
        }
      }

      cursor = response.next_cursor ?? undefined;
    } while (cursor);

    return nodes;
  }

  private async collectBlockTree(blockId: string, pageSize?: ListBlockChildrenParameters["page_size"]): Promise<PageBlock[]> {
    const nodes = await this.listChildren(blockId, { pageSize });

    for (const node of nodes) {
      if (node.type === "synced_block" && node.synced_block.synced_from) {
        node.children = await this.collectBlockTree(node.synced_block.synced_from.block_id, pageSize);
      } else if ("has_children" in node && node.has_children) {
        node.children = await this.collectBlockTree(node.id, pageSize);
      }
    }

    return nodes as PageBlock[];
  }

  private toSimpleBlockRecursive(node: PageBlock): SimpleBlock {
    const simpleBlock = { ...toSimpleBlock(node) };

    if (node.children?.length) {
      simpleBlock.children = node.children.map((child) => this.toSimpleBlockRecursive(child));
    }

    return simpleBlock;
  }
}
