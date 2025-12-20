import { beforeEach, describe, expect, it, vi } from "vitest";
import type {
  AppendBlockChildrenResponse,
  BlockObjectRequest,
  BlockObjectResponse,
  ListBlockChildrenResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

let appendCallCount = 0;
const appendBlockChildrenMock = vi.fn(async (_pageId: string, children: BlockObjectRequest[], _options?: { after?: string }) => {
  const callIndex = appendCallCount++;
  const results = children.map((_, childIndex) => createBlock(`block-${callIndex}-${childIndex}`));

  return {
    object: "list",
    type: "block",
    results,
    has_more: false,
    next_cursor: null,
  } as unknown as AppendBlockChildrenResponse;
});

const getBlockChildrenMock = vi.fn(async () => emptyListResponse);
const updateBlockMock = vi.fn();
const deleteBlockMock = vi.fn();

vi.mock("@/api/block", () => ({
  appendBlockChildren: appendBlockChildrenMock,
  getBlockChildren: getBlockChildrenMock,
  updateBlock: updateBlockMock,
  deleteBlock: deleteBlockMock,
}));

const updatePageMock = vi.fn(async () => createPage());
const archivePageMock = vi.fn();
const restorePageMock = vi.fn();
const clearPageContentMock = vi.fn();
const getPageMock = vi.fn(async () => createPage());

vi.mock("@/api/page", () => ({
  updatePage: updatePageMock,
  archivePage: archivePageMock,
  restorePage: restorePageMock,
  clearPageContent: clearPageContentMock,
  getPage: getPageMock,
}));

const { NotionPage } = await import("@/pages");

const emptyListResponse = {
  object: "list",
  type: "block",
  results: [],
  has_more: false,
  next_cursor: null,
} as unknown as ListBlockChildrenResponse;

function createBlock(id: string, overrides?: Partial<BlockObjectResponse>): BlockObjectResponse {
  return {
    object: "block",
    id,
    type: "paragraph",
    paragraph: { rich_text: [] },
    has_children: false,
    archived: false,
    in_trash: false,
    ...overrides,
  } as BlockObjectResponse;
}

function createPage(overrides?: Partial<PageObjectResponse>): PageObjectResponse {
  return {
    object: "page",
    id: overrides?.id ?? "page-id",
    created_time: "2024-01-01T00:00:00.000Z",
    last_edited_time: "2024-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user-1" },
    last_edited_by: { object: "user", id: "user-1" },
    cover: null,
    icon: null,
    parent: { type: "page_id", page_id: "parent-id" },
    archived: false,
    in_trash: false,
    properties: {
      Name: {
        id: "title",
        type: "title",
        title: [],
      },
    },
    url: "https://notion.so/page-id",
    public_url: null,
    ...overrides,
  } as unknown as PageObjectResponse;
}

describe("NotionPage", () => {
  beforeEach(() => {
    appendCallCount = 0;
    appendBlockChildrenMock.mockClear();
    getBlockChildrenMock.mockReset();
    updateBlockMock.mockReset();
    deleteBlockMock.mockReset();
    updatePageMock.mockClear();
    getPageMock.mockClear();
    getBlockChildrenMock.mockResolvedValue(emptyListResponse);
  });

  it("chunks block appends that exceed the Notion API limit", async () => {
    const page = new NotionPage("page-chunk");
    const block: BlockObjectRequest = {
      type: "paragraph",
      paragraph: { rich_text: [] },
    };
    const payload = Array.from({ length: 205 }, () => block);

    await page.append(payload);

    expect(appendBlockChildrenMock).toHaveBeenCalledTimes(3);
    expect(appendBlockChildrenMock.mock.calls[0][1]).toHaveLength(100);
    expect(appendBlockChildrenMock.mock.calls[1][1]).toHaveLength(100);
    expect(appendBlockChildrenMock.mock.calls[2][1]).toHaveLength(5);
  });

  it("threads the after cursor when inserting large batches", async () => {
    const page = new NotionPage("page-after");
    const block: BlockObjectRequest = {
      type: "paragraph",
      paragraph: { rich_text: [] },
    };
    const payload = Array.from({ length: 120 }, () => block);

    await page.insertAfter("existing-block", payload);

    expect(appendBlockChildrenMock.mock.calls[0][2]).toEqual({ after: "existing-block" });
    expect(appendBlockChildrenMock.mock.calls[1][2]).toEqual({ after: "block-0-99" });
  });

  it("recursively resolves child blocks when requested", async () => {
    const parent = createBlock("parent", { has_children: true });
    const child = createBlock("child");

    getBlockChildrenMock.mockResolvedValueOnce({
      ...emptyListResponse,
      results: [parent],
    });
    getBlockChildrenMock.mockResolvedValueOnce({
      ...emptyListResponse,
      results: [child],
    });

    const page = new NotionPage("page-tree");
    const blocks = await page.getBlocks({ recursive: true });

    expect(blocks).toHaveLength(1);
    expect(blocks[0].id).toBe("parent");
    expect(blocks[0].children?.[0].id).toBe("child");
  });

  it("derives the title property when updating titles", async () => {
    const initialPage = createPage();
    const updatedPage = createPage();

    updatePageMock.mockResolvedValueOnce(updatedPage);
    const page = new NotionPage(initialPage.id, initialPage);

    await page.updateTitle("Updated");

    expect(updatePageMock).toHaveBeenCalledWith(
      {
        pageId: initialPage.id,
        properties: {
          Name: {
            title: [
              {
                type: "text",
                text: expect.objectContaining({ content: "Updated" }),
              },
            ],
          },
        },
      },
      undefined // client param
    );
    expect(page.raw).toEqual(updatedPage);
  });
});
