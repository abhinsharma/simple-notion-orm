/**
 * Layout block factories for Notion API
 * Includes divider, table, columns, breadcrumb, and table of contents
 */

import type { RichTextItemRequest, ApiColor } from "@app-types/blocks";

/**
 * Forward declaration for BlockObjectRequest to support children
 */
type BlockWithChildren = Record<string, unknown>;

/**
 * Builds a divider block
 *
 * @returns Divider block payload
 *
 * @example
 * buildDividerBlock()
 */
export function buildDividerBlock() {
  return {
    type: "divider" as const,
    divider: {},
  };
}

/**
 * Builds a breadcrumb block
 *
 * @returns Breadcrumb block payload
 *
 * @example
 * buildBreadcrumbBlock()
 */
export function buildBreadcrumbBlock() {
  return {
    type: "breadcrumb" as const,
    breadcrumb: {},
  };
}

/**
 * Builds a table of contents block
 *
 * @param color - Optional color for the block
 * @returns Table of contents block payload
 *
 * @example
 * buildTableOfContentsBlock()
 * buildTableOfContentsBlock("gray_background")
 */
export function buildTableOfContentsBlock(color?: ApiColor) {
  return {
    type: "table_of_contents" as const,
    table_of_contents: {
      ...(color && { color }),
    },
  };
}

/**
 * Builds a table row block
 *
 * @param cells - Array of cell contents (each cell is an array of rich text)
 * @returns Table row block payload
 *
 * @example
 * buildTableRowBlock([
 *   [{ type: "text", text: { content: "Cell 1" } }],
 *   [{ type: "text", text: { content: "Cell 2" } }]
 * ])
 */
export function buildTableRowBlock(cells: RichTextItemRequest[][]) {
  return {
    type: "table_row" as const,
    table_row: {
      cells,
    },
  };
}

/**
 * Builds a table block
 *
 * @param children - Array of table row blocks
 * @param options - Optional table configuration (headers, column count)
 * @returns Table block payload
 *
 * @example
 * buildTableBlock(
 *   [
 *     buildTableRowBlock([[{ type: "text", text: { content: "Header 1" } }]]),
 *     buildTableRowBlock([[{ type: "text", text: { content: "Data 1" } }]])
 *   ],
 *   { has_column_header: true, has_row_header: false, table_width: 2 }
 * )
 */
export function buildTableBlock(
  children: ReturnType<typeof buildTableRowBlock>[],
  options?: {
    has_column_header?: boolean;
    has_row_header?: boolean;
    table_width?: number;
  }
) {
  return {
    type: "table" as const,
    table: {
      children,
      ...(options?.has_column_header !== undefined && { has_column_header: options.has_column_header }),
      ...(options?.has_row_header !== undefined && { has_row_header: options.has_row_header }),
      ...(options?.table_width && { table_width: options.table_width }),
    },
  };
}

/**
 * Builds a column block (used within column_list)
 *
 * @param children - Array of child blocks
 * @returns Column block payload
 *
 * @example
 * buildColumnBlock([paragraphBlock, imageBlock])
 */
export function buildColumnBlock(children: BlockWithChildren[]) {
  return {
    type: "column" as const,
    column: {
      children,
    },
  };
}

/**
 * Builds a column list block (multi-column layout)
 *
 * @param columns - Array of column blocks
 * @returns Column list block payload
 *
 * @example
 * buildColumnListBlock([
 *   buildColumnBlock([leftContent]),
 *   buildColumnBlock([rightContent])
 * ])
 */
export function buildColumnListBlock(columns: ReturnType<typeof buildColumnBlock>[]) {
  return {
    type: "column_list" as const,
    column_list: {
      children: columns,
    },
  };
}
