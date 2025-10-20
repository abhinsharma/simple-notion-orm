import { renderRichText } from "@/transform/markdown/richtext";
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";

function buildItem(partial: Partial<RichTextItemResponse>): RichTextItemResponse {
  return {
    type: "text",
    text: { content: "", link: null },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
    plain_text: "",
    href: null,
    ...partial,
  } as RichTextItemResponse;
}

describe("renderRichText", () => {
  it("renders annotations and links", () => {
    const items: RichTextItemResponse[] = [
      buildItem({
        text: { content: "bold", link: null },
        annotations: { bold: true, italic: false, strikethrough: false, underline: false, code: false, color: "default" },
        plain_text: "bold",
      }),
      buildItem({
        text: { content: " link", link: { url: "https://example.com" } },
        plain_text: " link",
      }),
    ];

    expect(renderRichText(items)).toBe("**bold**[ link](https://example.com)");
  });

  it("renders mentions", () => {
    const items: RichTextItemResponse[] = [
      {
        type: "mention",
        plain_text: "Notion Page",
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        href: "https://www.notion.so/notion-page",
        mention: {
          type: "page",
          page: { id: "notion-page" },
        },
      } as RichTextItemResponse,
    ];

    expect(renderRichText(items)).toBe("[Notion Page](https://www.notion.so/notion-page)");
  });

  it("renders inline equations", () => {
    const items: RichTextItemResponse[] = [
      {
        type: "equation",
        plain_text: "E=mc^2",
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        href: null,
        equation: {
          expression: "E=mc^2",
        },
      } as RichTextItemResponse,
    ];

    expect(renderRichText(items)).toBe("$E=mc^2$");
  });

  it("does not escape underscores inside code spans", () => {
    const items: RichTextItemResponse[] = [
      buildItem({
        text: { content: "foo_bar", link: null },
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: true,
          color: "default",
        },
        plain_text: "foo_bar",
      }),
    ];

    expect(renderRichText(items)).toBe("`foo_bar`");
  });

  it("prefixes user mentions with at symbol", () => {
    const items: RichTextItemResponse[] = [
      {
        type: "mention",
        plain_text: "Notion User",
        annotations: {
          bold: false,
          italic: false,
          strikethrough: false,
          underline: false,
          code: false,
          color: "default",
        },
        href: null,
        mention: {
          type: "user",
          user: { object: "user", id: "obf_user" },
        },
      } as RichTextItemResponse,
    ];

    expect(renderRichText(items)).toBe("@Notion User");
  });
});
