import { appendBlockChildren, deleteBlock as deleteBlockApi, updateBlock as updateBlockApi } from "@/api/block";
import { archivePage, clearPageContent, getPage, restorePage, updatePage } from "@/api/page";
import type {
  BlockObjectRequest,
  BlockObjectResponse,
  ListBlockChildrenParameters,
  PageObjectResponse,
  UpdateBlockParameters,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";
import { NotionBlocks, type PageBlock } from "./notion-blocks";
export type { PageBlock } from "./notion-blocks";

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

  constructor(
    private readonly pageId: string,
    metadata?: PageObjectResponse,
    blocksHelper?: NotionBlocks
  ) {
    this.metadata = metadata;
    this.blocksHelper = blocksHelper ?? NotionBlocks.forPage(pageId);
  }

  static async from(pageId: string): Promise<NotionPage> {
    const page = await getPage(pageId);
    return new NotionPage(pageId, page);
  }

  static fromPage(page: PageObjectResponse): NotionPage {
    return new NotionPage(page.id, page);
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
    this.metadata = await getPage(this.pageId, filterProperties);
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

    const response = await updatePage({
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
    });

    this.metadata = response;
    return response;
  }

  async setIcon(icon: UpdatePageParameters["icon"]): Promise<PageObjectResponse> {
    const response = await updatePage({
      pageId: this.pageId,
      icon,
    });
    this.metadata = response;
    return response;
  }

  async setCover(cover: UpdatePageParameters["cover"]): Promise<PageObjectResponse> {
    const response = await updatePage({
      pageId: this.pageId,
      cover,
    });
    this.metadata = response;
    return response;
  }

  async archive(): Promise<PageObjectResponse> {
    const response = await archivePage(this.pageId);
    this.metadata = response;
    return response;
  }

  async restore(): Promise<PageObjectResponse> {
    const response = await restorePage(this.pageId);
    this.metadata = response;
    return response;
  }

  async clearContent(): Promise<void> {
    await clearPageContent(this.pageId);
  }

  async append(blocks: AppendInput, options?: { after?: string }): Promise<this> {
    const normalized = this.toArray(blocks);
    let after = options?.after;

    for (const chunk of this.chunkBlocks(normalized)) {
      const response = await appendBlockChildren(this.pageId, chunk, after ? { after } : undefined);
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
    await updateBlockApi({
      blockId,
      ...patch,
    });
  }

  async deleteBlock(blockId: string): Promise<void> {
    await deleteBlockApi(blockId);
  }

  async getBlocks(options?: GetBlocksOptions): Promise<PageBlock[]> {
    if (options?.recursive) {
      return this.blocksHelper.getContentRaw({ pageSize: options.pageSize });
    }

    const blocks = await this.blocksHelper.listRaw({ pageSize: options?.pageSize });
    return blocks.map((block) => ({ ...block }));
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
