import { getBlockChildren } from "@/api/block";
import { createComment, listComments } from "@/api/comment";
import { toSimpleBlock, toSimpleBlocks, type PageBlock, type SimpleBlock } from "@/transform/blocks";
import type { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  CommentObjectResponse,
  CreateCommentParameters,
  ListBlockChildrenParameters,
  ListCommentsResponse,
} from "@notionhq/client/build/src/api-endpoints";

type RichTextInput = CreateCommentParameters["rich_text"];

type ListOptions = {
  pageSize?: ListBlockChildrenParameters["page_size"];
  startCursor?: ListBlockChildrenParameters["start_cursor"];
};

type ContentOptions = {
  pageSize?: ListBlockChildrenParameters["page_size"];
  recursive?: boolean;
};

type StreamOptions = {
  pageSize?: ListBlockChildrenParameters["page_size"];
  recursive?: boolean;
};

function isBlockObject(result: { object: string }): result is BlockObjectResponse {
  return result.object === "block";
}

export class NotionBlocks {
  private constructor(
    private readonly pageId: string,
    private readonly client?: Client
  ) {}

  static forPage(pageId: string, client?: Client): NotionBlocks {
    return new NotionBlocks(pageId, client);
  }

  async listRaw(options?: ListOptions): Promise<PageBlock[]> {
    return this.listChildren(this.pageId, options);
  }

  async list(options?: ListOptions): Promise<SimpleBlock[]> {
    return toSimpleBlocks(await this.listRaw(options));
  }

  async getContentRaw(options?: ContentOptions): Promise<PageBlock[]> {
    if (options?.recursive === false) {
      const nodes = await this.listRaw({ pageSize: options?.pageSize });
      return nodes.map((node) => ({ ...node }));
    }

    return this.collectBlockTree(this.pageId, options?.pageSize);
  }

  async getContent(options?: ContentOptions): Promise<SimpleBlock[]> {
    const rawTree = await this.getContentRaw(options);
    return rawTree.map((block) => this.toSimpleBlockRecursive(block));
  }

  async *streamRaw(options?: StreamOptions): AsyncGenerator<PageBlock> {
    const recursive = options?.recursive ?? true;
    const stack: string[] = [this.pageId];

    while (stack.length) {
      const current = stack.pop()!;
      let cursor: string | undefined;

      do {
        const response = await getBlockChildren(
          current,
          {
            ...(cursor ? { start_cursor: cursor } : {}),
            ...(options?.pageSize ? { page_size: options.pageSize } : {}),
          },
          this.client
        );

        for (const result of response.results) {
          if (!isBlockObject(result)) {
            continue;
          }

          yield { ...result } as PageBlock;

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

  async listComments(blockId: string, options?: { startCursor?: string; pageSize?: number }): Promise<ListCommentsResponse> {
    return listComments(
      {
        block_id: blockId,
        ...(options?.startCursor && { start_cursor: options.startCursor }),
        ...(options?.pageSize && { page_size: options.pageSize }),
      },
      this.client
    );
  }

  async addComment(blockId: string, content: string | RichTextInput): Promise<CommentObjectResponse> {
    const richText: RichTextInput = typeof content === "string" ? [{ type: "text", text: { content } }] : content;

    const response = await createComment({ parent: { block_id: blockId }, rich_text: richText }, this.client);
    return response as CommentObjectResponse;
  }

  private async listChildren(blockId: string, options?: ListOptions): Promise<PageBlock[]> {
    const nodes: PageBlock[] = [];
    let cursor = options?.startCursor;

    do {
      const response = await getBlockChildren(
        blockId,
        {
          ...(cursor ? { start_cursor: cursor } : {}),
          ...(options?.pageSize ? { page_size: options.pageSize } : {}),
        },
        this.client
      );

      for (const item of response.results) {
        if (isBlockObject(item)) {
          nodes.push({ ...item });
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

    return nodes;
  }

  private toSimpleBlockRecursive(node: PageBlock): SimpleBlock {
    return toSimpleBlock(node, (child) => this.toSimpleBlockRecursive(child));
  }
}

export type { PageBlock } from "@/transform/blocks";
