import type {
  PageBlock,
  SimpleBreadcrumbBlock,
  SimpleColumnListBlock,
  SimpleDividerBlock,
  SimpleTableBlock,
  SimpleTableOfContentsBlock,
  SimpleBlock,
} from "./types";
import { normalizeColor, toSimpleRichTextSpanArray } from "./richtext";

export function fromDivider(block: Extract<PageBlock, { type: "divider" }>): SimpleDividerBlock {
  return { type: "divider", id: block.id };
}

export function fromBreadcrumb(block: Extract<PageBlock, { type: "breadcrumb" }>): SimpleBreadcrumbBlock {
  return { type: "breadcrumb", id: block.id };
}

export function fromTableOfContents(block: Extract<PageBlock, { type: "table_of_contents" }>): SimpleTableOfContentsBlock {
  const color = normalizeColor(block.table_of_contents.color);
  return {
    type: "table_of_contents",
    id: block.id,
    ...(color ? { color } : {}),
  };
}

export function fromColumnList(block: Extract<PageBlock, { type: "column_list" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleColumnListBlock {
  const columns = (block.children ?? []).filter((child): child is Extract<PageBlock, { type: "column" }> => child.type === "column");

  return {
    type: "column_list",
    id: block.id,
    columns: columns.map((column) => ({
      id: column.id,
      children: (column.children ?? []).map(transformChild),
    })),
  };
}

export function fromTable(block: Extract<PageBlock, { type: "table" }>): SimpleTableBlock {
  const rows = (block.children ?? []).filter((child): child is Extract<PageBlock, { type: "table_row" }> => child.type === "table_row");

  return {
    type: "table",
    id: block.id,
    hasColumnHeader: block.table.has_column_header,
    hasRowHeader: block.table.has_row_header,
    tableWidth: block.table.table_width,
    rows: rows.map((row) => row.table_row.cells.map((cell) => toSimpleRichTextSpanArray(cell))),
  };
}
