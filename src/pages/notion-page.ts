import { appendBlockChildren, deleteBlock as deleteBlockApi, updateBlock as updateBlockApi } from "@/api/block";
import { createComment, listComments } from "@/api/comment";
import { archivePage, clearPageContent, getPage, restorePage, updatePage } from "@/api/page";
import type { Client } from "@notionhq/client";
import type {
  BlockObjectRequest,
  BlockObjectResponse,
  CommentObjectResponse,
  CreateCommentParameters,
  ListBlockChildrenParameters,
  ListCommentsResponse,
  PageObjectResponse,
  UpdateBlockParameters,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { NotionBlocks, type PageBlock } from "./notion-blocks";
export type { PageBlock } from "./notion-blocks";

type RichTextInput = CreateCommentParameters["rich_text"];

const MAX_CHILDREN_PER_REQUEST = 100;

type AppendInput = BlockObjectRequest | BlockObjectRequest[];

export type GetBlocksOptions = {
  recursive?: boolean;
  pageSize?: ListBlockChildrenParameters["page_size"];
};

export type GetPageOptions = {
  filterProperties?: string[];
  includeChildren?: boolean;
  recursiveChildren?: boolean;
  pageSize?: ListBlockChildrenParameters["page_size"];
};

type UpdateBlockInput = Omit<UpdateBlockParameters, "block_id">;

/**
 * Fluent helper for interacting with a Notion page's blocks and metadata.
 * Instances are lightweight wrappers around an existing page ID and cache the last loaded metadata.
 */
export class NotionPage {
  private metadata?: PageObjectResponse;
  private readonly blocksHelper: NotionBlocks;
  private readonly client?: Client;

  constructor(
    private readonly pageId: string,
    metadata?: PageObjectResponse,
    blocksHelper?: NotionBlocks,
    client?: Client
  ) {
    this.metadata = metadata;
    this.client = client;
    this.blocksHelper = blocksHelper ?? NotionBlocks.forPage(pageId, client);
  }

  static async from(pageId: string, client?: Client): Promise<NotionPage> {
    const page = await getPage(pageId, undefined, client);
    return new NotionPage(pageId, page, undefined, client);
  }

  static fromPage(page: PageObjectResponse, client?: Client): NotionPage {
    return new NotionPage(page.id, page, undefined, client);
  }

  get id(): string {
    return this.pageId;
  }

  get raw(): PageObjectResponse | undefined {
    return this.metadata;
  }

  get blocks(): NotionBlocks {
    return this.blocksHelper;
  }

  /**
   * Refreshes the cached page metadata from the API.
   */
  async refresh(filterProperties?: string[]): Promise<PageObjectResponse> {
    this.metadata = await getPage(this.pageId, filterProperties, this.client);
    return this.metadata;
  }

  /**
   * Retrieves the page metadata and optionally includes the current block tree.
   */
  async get(options?: GetPageOptions): Promise<PageObjectResponse & { children?: PageBlock[] }> {
    const page = await this.refresh(options?.filterProperties);

    if (!options?.includeChildren) {
      return page;
    }

    const blocks = await this.getBlocks({
      recursive: options?.recursiveChildren ?? true,
      pageSize: options?.pageSize,
    });

    return { ...page, children: blocks };
  }

  /**
   * Updates the page title by locating the primary title property.
   */
  async updateTitle(title: string): Promise<PageObjectResponse> {
    const metadata = await this.ensureMetadata();
    const titlePropertyName = this.findTitleProperty(metadata);

    const response = await updatePage(
      {
        pageId: this.pageId,
        properties: {
          [titlePropertyName]: {
            title: [
              {
                type: "text" as const,
                text: { content: title },
              },
            ],
          },
        },
      },
      this.client
    );

    this.metadata = response;
    return response;
  }

  async setIcon(icon: UpdatePageParameters["icon"]): Promise<PageObjectResponse> {
    const response = await updatePage({ pageId: this.pageId, icon }, this.client);
    this.metadata = response;
    return response;
  }

  async setCover(cover: UpdatePageParameters["cover"]): Promise<PageObjectResponse> {
    const response = await updatePage({ pageId: this.pageId, cover }, this.client);
    this.metadata = response;
    return response;
  }

  async archive(): Promise<PageObjectResponse> {
    const response = await archivePage(this.pageId, this.client);
    this.metadata = response;
    return response;
  }

  async restore(): Promise<PageObjectResponse> {
    const response = await restorePage(this.pageId, this.client);
    this.metadata = response;
    return response;
  }

  async clearContent(): Promise<void> {
    await clearPageContent(this.pageId, this.client);
  }

  async append(blocks: AppendInput, options?: { after?: string }): Promise<this> {
    const normalized = this.toArray(blocks);
    let after = options?.after;

    for (const chunk of this.chunkBlocks(normalized)) {
      const response = await appendBlockChildren(this.pageId, chunk, after ? { after } : undefined, this.client);
      const appendedBlocks = response.results.filter((item): item is BlockObjectResponse => item.object === "block");
      const lastBlock = appendedBlocks[appendedBlocks.length - 1];
      after = lastBlock?.id;
    }

    return this;
  }

  add(blocks: AppendInput): Promise<this> {
    return this.append(blocks);
  }

  insertAfter(blockId: string, blocks: AppendInput): Promise<this> {
    return this.append(blocks, { after: blockId });
  }

  async updateBlock(blockId: string, patch: UpdateBlockInput): Promise<void> {
    await updateBlockApi({ blockId, ...patch }, this.client);
  }

  async deleteBlock(blockId: string): Promise<void> {
    await deleteBlockApi(blockId, this.client);
  }

  async getBlocks(options?: GetBlocksOptions): Promise<PageBlock[]> {
    if (options?.recursive) {
      return this.blocksHelper.getContentRaw({ pageSize: options.pageSize });
    }

    const blocks = await this.blocksHelper.listRaw({ pageSize: options?.pageSize });
    return blocks.map((block) => ({ ...block }));
  }

  async listComments(options?: { startCursor?: string; pageSize?: number }): Promise<ListCommentsResponse> {
    return listComments(
      {
        block_id: this.pageId,
        ...(options?.startCursor && { start_cursor: options.startCursor }),
        ...(options?.pageSize && { page_size: options.pageSize }),
      },
      this.client
    );
  }

  async addComment(content: string | RichTextInput): Promise<CommentObjectResponse> {
    const richText: RichTextInput = typeof content === "string" ? [{ type: "text", text: { content } }] : content;

    const response = await createComment({ parent: { page_id: this.pageId }, rich_text: richText }, this.client);
    return response as CommentObjectResponse;
  }

  async replyToComment(discussionId: string, content: string | RichTextInput): Promise<CommentObjectResponse> {
    const richText: RichTextInput = typeof content === "string" ? [{ type: "text", text: { content } }] : content;

    const response = await createComment({ discussion_id: discussionId, rich_text: richText }, this.client);
    return response as CommentObjectResponse;
  }

  private async ensureMetadata(): Promise<PageObjectResponse> {
    if (this.metadata) {
      return this.metadata;
    }

    return this.refresh();
  }

  private findTitleProperty(metadata: PageObjectResponse): string {
    for (const [name, property] of Object.entries(metadata.properties ?? {})) {
      if (property.type === "title") {
        return name;
      }
    }

    throw new Error("Page has no title property to update");
  }

  private toArray(blocks: AppendInput): BlockObjectRequest[] {
    return Array.isArray(blocks) ? blocks : [blocks];
  }

  private chunkBlocks(blocks: BlockObjectRequest[]): BlockObjectRequest[][] {
    const chunks: BlockObjectRequest[][] = [];
    for (let i = 0; i < blocks.length; i += MAX_CHILDREN_PER_REQUEST) {
      chunks.push(blocks.slice(i, i + MAX_CHILDREN_PER_REQUEST));
    }
    return chunks;
  }
}
