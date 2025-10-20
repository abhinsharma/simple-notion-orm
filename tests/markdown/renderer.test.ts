import { renderMarkdown, renderMarkdownByPageId } from "@/transform/markdown";
import * as blockApi from "@/api/block";
import type { ListBlockChildrenResponse } from "@notionhq/client/build/src/api-endpoints";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sampleBlocks } from "../fixtures/notion/markdown/sample-blocks";

describe("renderMarkdown", () => {
  it("renders a complex block tree to markdown", () => {
    const { markdown } = renderMarkdown(sampleBlocks);
    expect(markdown).toMatchSnapshot();
  });
});

describe("renderMarkdownByPageId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches the block tree before rendering", async () => {
    const blockResponse: ListBlockChildrenResponse = {
      object: "list",
      results: [
        {
          object: "block",
          id: "paragraph-1",
          created_time: "2025-10-19T00:00:00.000Z",
          last_edited_time: "2025-10-19T00:00:00.000Z",
          created_by: { object: "user", id: "user" },
          last_edited_by: { object: "user", id: "user" },
          has_children: false,
          archived: false,
          in_trash: false,
          type: "paragraph",
          paragraph: {
            color: "default",
            rich_text: [
              {
                type: "text",
                text: { content: "Fetched paragraph", link: null },
                annotations: {
                  bold: false,
                  italic: false,
                  strikethrough: false,
                  underline: false,
                  code: false,
                  color: "default",
                },
                plain_text: "Fetched paragraph",
                href: null,
              },
            ],
          },
        },
      ],
      next_cursor: null,
      has_more: false,
      type: "block",
      block: {},
    };

    const spy = vi
      .spyOn(blockApi, "getBlockChildren")
      .mockResolvedValue(blockResponse);

    const { markdown } = await renderMarkdownByPageId("page-id");
    expect(spy).toHaveBeenCalledWith("page-id", undefined);
    expect(markdown.trim()).toBe("Fetched paragraph");
  });
});
