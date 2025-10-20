import type { BlockNode } from "@/transform/markdown";
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

const userRef = { object: "user" as const, id: "obf_user" };
const timestamp = "2025-10-19T00:00:00.000Z";

function text(
  content: string,
  annotations?: Partial<RichTextItemResponse["annotations"]>
): RichTextItemResponse {
  return {
    type: "text",
    plain_text: content,
    href: null,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
      ...(annotations ?? {}),
    },
    text: {
      content,
      link: null,
    },
  } satisfies RichTextItemResponse;
}

function mention(content: string): RichTextItemResponse {
  return {
    type: "mention",
    plain_text: content,
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
    href: "https://www.notion.so/sample-page",
    mention: {
      type: "page",
      page: {
        id: "obf_page",
      },
    },
  } as RichTextItemResponse;
}

function baseBlock<T extends BlockNode>(block: T): T {
  return {
    object: "block",
    created_time: timestamp,
    last_edited_time: timestamp,
    created_by: userRef,
    last_edited_by: userRef,
    archived: false,
    in_trash: false,
    ...block,
  } as T;
}

export const sampleBlocks: BlockNode[] = [
  baseBlock({
    id: "heading-1",
    type: "heading_1",
    has_children: false,
    heading_1: {
      is_toggleable: false,
      color: "default",
      rich_text: [text("Markdown Renderer Demo")],
    },
  }),
  baseBlock({
    id: "paragraph-intro",
    type: "paragraph",
    has_children: false,
    paragraph: {
      color: "default",
      rich_text: [
        text("Bold", { bold: true }),
        text(" and "),
        text("italic", { italic: true }),
        text(" with a link"),
        {
          ...text(" to Notion"),
          text: {
            content: " to Notion",
            link: { url: "https://www.notion.so" },
          },
        },
        text(" and a mention: "),
        mention("Notion Page"),
        text("."),
      ],
    },
  }),
  baseBlock({
    id: "list-bullet",
    type: "bulleted_list_item",
    has_children: true,
    bulleted_list_item: {
      color: "default",
      rich_text: [text("Top bullet")],
    },
    children: [
      baseBlock({
        id: "list-bullet-nested",
        type: "bulleted_list_item",
        has_children: false,
        bulleted_list_item: {
          color: "default",
          rich_text: [text("Nested bullet item")],
        },
      }),
    ],
  }),
  baseBlock({
    id: "list-numbered",
    type: "numbered_list_item",
    has_children: false,
    numbered_list_item: {
      color: "default",
      rich_text: [text("Numbered item")],
    },
  }),
  baseBlock({
    id: "todo-item",
    type: "to_do",
    has_children: true,
    to_do: {
      color: "default",
      checked: false,
      rich_text: [text("Todo parent")],
    },
    children: [
      baseBlock({
        id: "todo-child",
        type: "paragraph",
        has_children: false,
        paragraph: {
          color: "default",
          rich_text: [text("Todo child paragraph")],
        },
      }),
    ],
  }),
  baseBlock({
    id: "toggle-block",
    type: "toggle",
    has_children: true,
    toggle: {
      color: "default",
      rich_text: [text("Toggle summary")],
    },
    children: [
      baseBlock({
        id: "toggle-child",
        type: "paragraph",
        has_children: false,
        paragraph: {
          color: "default",
          rich_text: [text("Toggle children rendered inside details")],
        },
      }),
    ],
  }),
  baseBlock({
    id: "quote-block",
    type: "quote",
    has_children: false,
    quote: {
      color: "default",
      rich_text: [text("Quoted wisdom")],
    },
  }),
  baseBlock({
    id: "callout-block",
    type: "callout",
    has_children: true,
    callout: {
      color: "default",
      icon: { type: "emoji", emoji: "💡" },
      rich_text: [text("Remember this tip")],
    },
    children: [
      baseBlock({
        id: "callout-child",
        type: "paragraph",
        has_children: false,
        paragraph: {
          color: "default",
          rich_text: [text("Callout child content")],
        },
      }),
    ],
  }),
  baseBlock({
    id: "code-block",
    type: "code",
    has_children: false,
    code: {
      caption: [],
      language: "typescript",
      rich_text: [text("console.log('Hello Markdown');")],
    },
  }),
  baseBlock({
    id: "divider-block",
    type: "divider",
    has_children: false,
    divider: {},
  }),
  baseBlock({
    id: "image-block",
    type: "image",
    has_children: false,
    image: {
      type: "external",
      external: { url: "https://example.com/image.png" },
      caption: [text("Image caption")],
    },
  }),
  baseBlock({
    id: "video-block",
    type: "video",
    has_children: false,
    video: {
      type: "external",
      external: { url: "https://example.com/video.mp4" },
      caption: [text("Video caption")],
    },
  }),
  baseBlock({
    id: "bookmark-block",
    type: "bookmark",
    has_children: false,
    bookmark: {
      url: "https://example.com",
      caption: [text("Bookmark caption")],
    },
  }),
  baseBlock({
    id: "embed-block",
    type: "embed",
    has_children: false,
    embed: {
      url: "https://example.com/embed",
      caption: [text("Embed caption")],
    },
  }),
  baseBlock({
    id: "equation-block",
    type: "equation",
    has_children: false,
    equation: {
      expression: "E = mc^2",
    },
  }),
  baseBlock({
    id: "table-block",
    type: "table",
    has_children: true,
    table: {
      table_width: 2,
      has_column_header: true,
      has_row_header: false,
    },
    children: [
      baseBlock({
        id: "table-header",
        type: "table_row",
        has_children: false,
        table_row: {
          cells: [[text("Column A")], [text("Column B")]],
        },
      }),
      baseBlock({
        id: "table-row-1",
        type: "table_row",
        has_children: false,
        table_row: {
          cells: [[text("Value A1")], [text("Value B1")]],
        },
      }),
    ],
  }),
  baseBlock({
    id: "columns-block",
    type: "column_list",
    has_children: true,
    column_list: {},
    children: [
      baseBlock({
        id: "column-1",
        type: "column",
        has_children: true,
        column: {},
        children: [
          baseBlock({
            id: "column-1-paragraph",
            type: "paragraph",
            has_children: false,
            paragraph: {
              color: "default",
              rich_text: [text("Column one content")],
            },
          }),
        ],
      }),
      baseBlock({
        id: "column-2",
        type: "column",
        has_children: true,
        column: {},
        children: [
          baseBlock({
            id: "column-2-paragraph",
            type: "paragraph",
            has_children: false,
            paragraph: {
              color: "default",
              rich_text: [text("Column two content")],
            },
          }),
        ],
      }),
    ],
  }),
];
