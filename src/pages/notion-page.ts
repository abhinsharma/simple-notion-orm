import { appendBlockChildren, deleteBlock as deleteBlockApi, getBlockChildren, updateBlock as updateBlockApi } from "@/api/block";
import { archivePage, clearPageContent, getPage, restorePage, updatePage } from "@/api/page";
import type {
  BlockObjectRequest,
  BlockObjectResponse,
  ListBlockChildrenParameters,
  ListBlockChildrenResponse,
  PageObjectResponse,
  UpdateBlockParameters,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";

const MAX_CHILDREN_PER_REQUEST = 100;

type AppendInput = BlockObjectRequest | BlockObjectRequest[];

function isBlockObject(result: ListBlockChildrenResponse["results"][number]): result is BlockObjectResponse {
  return result.object === "block";
}

export type PageBlock = BlockObjectResponse & { children?: PageBlock[] };

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

  constructor(
    private readonly pageId: string,
    metadata?: PageObjectResponse
  ) {
    this.metadata = metadata;
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
      return this.collectBlockTree(this.pageId, options.pageSize);
    }

    return this.listChildren(this.pageId, options?.pageSize);
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

  private async listChildren(blockId: string, pageSize?: ListBlockChildrenParameters["page_size"]): Promise<PageBlock[]> {
    const nodes: PageBlock[] = [];
    let cursor: string | undefined;

    do {
      const response = await getBlockChildren(blockId, {
        ...(cursor ? { start_cursor: cursor } : {}),
        ...(pageSize ? { page_size: pageSize } : {}),
      });

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
    const nodes = await this.listChildren(blockId, pageSize);

    for (const node of nodes) {
      if (node.type === "synced_block" && node.synced_block.synced_from) {
        node.children = await this.collectBlockTree(node.synced_block.synced_from.block_id, pageSize);
      } else if ("has_children" in node && node.has_children) {
        node.children = await this.collectBlockTree(node.id, pageSize);
      }
    }

    return nodes;
  }
}
