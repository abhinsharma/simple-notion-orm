import { toSimpleBlock, type PageBlock, type SimpleBlock } from "@/transform/blocks";
import { describe, expect, it } from "vitest";

const baseMeta = {
  object: "block" as const,
  parent: { type: "page_id" as const, page_id: "parent-id" },
  created_time: "2025-01-01T00:00:00.000Z",
  last_edited_time: "2025-01-01T00:00:00.000Z",
  created_by: { object: "user" as const, id: "user" },
  last_edited_by: { object: "user" as const, id: "user" },
  archived: false,
  in_trash: false,
};

const annotations = {
  bold: false,
  italic: false,
  strikethrough: false,
  underline: false,
  code: false,
  color: "default" as const,
};

const paragraphBlock: PageBlock = {
  ...baseMeta,
  id: "paragraph",
  has_children: true,
  type: "paragraph",
  paragraph: {
    rich_text: [
      {
        type: "text",
        text: { content: "Sample text", link: null },
        annotations,
        plain_text: "Sample text",
        href: null,
      },
    ],
    color: "default",
  },
  children: [
    {
      ...baseMeta,
      id: "child",
      has_children: false,
      type: "to_do",
      to_do: {
        rich_text: [
          {
            type: "text",
            text: { content: "Nested task", link: null },
            annotations,
            plain_text: "Nested task",
            href: null,
          },
        ],
        checked: true,
        color: "default",
      },
    } as PageBlock,
  ],
};

const columnListBlock: PageBlock = {
  ...baseMeta,
  id: "column-list",
  has_children: true,
  type: "column_list",
  column_list: {},
  children: [
    {
      ...baseMeta,
      id: "column-1",
      has_children: true,
      type: "column",
      column: {},
      children: [paragraphBlock],
    } as PageBlock,
  ],
};

const tableBlock: PageBlock = {
  ...baseMeta,
  id: "table",
  has_children: true,
  type: "table",
  table: { has_column_header: true, has_row_header: false, table_width: 2 },
  children: [
    {
      ...baseMeta,
      id: "row-1",
      has_children: false,
      type: "table_row",
      table_row: {
        cells: [
          [
            {
              type: "text",
              text: { content: "Cell 1", link: null },
              annotations,
              plain_text: "Cell 1",
              href: null,
            },
          ],
          [
            {
              type: "text",
              text: { content: "Cell 2", link: null },
              annotations,
              plain_text: "Cell 2",
              href: null,
            },
          ],
        ],
      },
    } as PageBlock,
  ],
};

const syncedSourceBlock: PageBlock = {
  ...baseMeta,
  id: "synced-source",
  has_children: true,
  type: "synced_block",
  synced_block: { synced_from: null },
  children: [paragraphBlock],
};

const syncedReferenceBlock: PageBlock = {
  ...baseMeta,
  id: "synced-ref",
  has_children: false,
  type: "synced_block",
  synced_block: { synced_from: { type: "block_id", block_id: "synced-source" } },
};

const childDatabaseBlock: PageBlock = {
  ...baseMeta,
  id: "child-db",
  has_children: false,
  type: "child_database",
  child_database: { title: "Projects" },
};

const childPageBlock: PageBlock = {
  ...baseMeta,
  id: "child-page",
  has_children: false,
  type: "child_page",
  child_page: { title: "Overview" },
};

function convert(block: PageBlock): SimpleBlock {
  return toSimpleBlock(block, convert);
}

describe("toSimpleBlock", () => {
  it("simplifies paragraphs and children", () => {
    const result = convert(paragraphBlock);
    expect(result).toMatchObject({
      type: "paragraph",
      text: [{ plainText: "Sample text" }],
      children: [{ type: "to_do", checked: true }],
    });
  });

  it("converts column lists into column arrays", () => {
    const result = convert(columnListBlock);
    expect(result.type).toBe("column_list");
    if (result.type !== "column_list") return;
    expect(result.columns[0].children[0].type).toBe("paragraph");
  });

  it("maps table rows to cell arrays", () => {
    const result = convert(tableBlock);
    expect(result).toMatchObject({
      type: "table",
      rows: [[[{ plainText: "Cell 1" }], [{ plainText: "Cell 2" }]]],
    });
  });

  it("captures synced block metadata", () => {
    const source = convert(syncedSourceBlock);
    expect(source).toMatchObject({ type: "synced_block", kind: "source", sourceBlockId: "synced-source" });
    const reference = convert(syncedReferenceBlock);
    expect(reference).toMatchObject({ type: "synced_block", kind: "reference", sourceBlockId: "synced-source" });
  });

  it("handles child databases", () => {
    const result = convert(childDatabaseBlock);
    expect(result).toMatchObject({ type: "child_database", id: "child-db", databaseId: "child-db", title: "Projects" });
  });

  it("handles child pages", () => {
    const result = convert(childPageBlock);
    expect(result).toMatchObject({ type: "child_page", id: "child-page", pageId: "child-page", title: "Overview" });
  });
});
