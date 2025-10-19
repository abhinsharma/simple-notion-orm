/**
 * Text block factories for Notion API
 * Includes paragraph, headings, lists, quotes, toggles, and to-dos
 */

import type { RichTextItemRequest, ApiColor, HeadingLevel } from "@app-types/blocks";

/**
 * Forward declaration for BlockObjectRequest to support children
 * This will be the union of all block types
 */
type BlockWithChildren = Record<string, unknown>;

/**
 * Builds a paragraph block
 *
 * @param richText - Array of rich text items
 * @param options - Optional color and children
 * @returns Paragraph block payload
 *
 * @example
 * buildParagraphBlock([{ type: "text", text: { content: "Hello world" } }])
 * buildParagraphBlock(
 *   [{ type: "text", text: { content: "Parent paragraph" } }],
 *   { color: "blue", children: [childBlock] }
 * )
 */
export function buildParagraphBlock(
  richText: RichTextItemRequest[],
  options?: {
    color?: ApiColor;
    children?: BlockWithChildren[];
  }
) {
  return {
    type: "paragraph" as const,
    paragraph: {
      rich_text: richText,
      ...(options?.color && { color: options.color }),
      ...(options?.children && { children: options.children }),
    },
  };
}

/**
 * Builds a heading block (H1, H2, or H3)
 *
 * @param level - Heading level (1, 2, or 3)
 * @param richText - Array of rich text items
 * @param options - Optional color, toggleable, and children
 * @returns Heading block payload
 *
 * @example
 * buildHeadingBlock(1, [{ type: "text", text: { content: "Main Title" } }])
 * buildHeadingBlock(
 *   2,
 *   [{ type: "text", text: { content: "Toggleable Section" } }],
 *   { is_toggleable: true, children: [childBlock] }
 * )
 */
export function buildHeadingBlock(
  level: HeadingLevel,
  richText: RichTextItemRequest[],
  options?: {
    color?: ApiColor;
    is_toggleable?: boolean;
    children?: BlockWithChildren[];
  }
) {
  const headingType = `heading_${level}` as "heading_1" | "heading_2" | "heading_3";

  return {
    type: headingType,
    [headingType]: {
      rich_text: richText,
      ...(options?.color && { color: options.color }),
      ...(options?.is_toggleable !== undefined && { is_toggleable: options.is_toggleable }),
      ...(options?.children && { children: options.children }),
    },
  };
}

/**
 * Builds a bulleted list item block
 *
 * @param richText - Array of rich text items
 * @param options - Optional color and children
 * @returns Bulleted list item block payload
 *
 * @example
 * buildBulletedListItemBlock([{ type: "text", text: { content: "First item" } }])
 * buildBulletedListItemBlock(
 *   [{ type: "text", text: { content: "Parent item" } }],
 *   { children: [nestedItem] }
 * )
 */
export function buildBulletedListItemBlock(
  richText: RichTextItemRequest[],
  options?: {
    color?: ApiColor;
    children?: BlockWithChildren[];
  }
) {
  return {
    type: "bulleted_list_item" as const,
    bulleted_list_item: {
      rich_text: richText,
      ...(options?.color && { color: options.color }),
      ...(options?.children && { children: options.children }),
    },
  };
}

/**
 * Builds a numbered list item block
 *
 * @param richText - Array of rich text items
 * @param options - Optional color and children
 * @returns Numbered list item block payload
 *
 * @example
 * buildNumberedListItemBlock([{ type: "text", text: { content: "Step 1" } }])
 */
export function buildNumberedListItemBlock(
  richText: RichTextItemRequest[],
  options?: {
    color?: ApiColor;
    children?: BlockWithChildren[];
  }
) {
  return {
    type: "numbered_list_item" as const,
    numbered_list_item: {
      rich_text: richText,
      ...(options?.color && { color: options.color }),
      ...(options?.children && { children: options.children }),
    },
  };
}

/**
 * Builds a to-do block (checkbox item)
 *
 * @param richText - Array of rich text items
 * @param options - Optional checked state, color, and children
 * @returns To-do block payload
 *
 * @example
 * buildToDoBlock([{ type: "text", text: { content: "Complete task" } }])
 * buildToDoBlock(
 *   [{ type: "text", text: { content: "Done task" } }],
 *   { checked: true }
 * )
 */
export function buildToDoBlock(
  richText: RichTextItemRequest[],
  options?: {
    checked?: boolean;
    color?: ApiColor;
    children?: BlockWithChildren[];
  }
) {
  return {
    type: "to_do" as const,
    to_do: {
      rich_text: richText,
      ...(options?.checked !== undefined && { checked: options.checked }),
      ...(options?.color && { color: options.color }),
      ...(options?.children && { children: options.children }),
    },
  };
}

/**
 * Builds a toggle block
 *
 * @param richText - Array of rich text items
 * @param options - Optional color and children
 * @returns Toggle block payload
 *
 * @example
 * buildToggleBlock(
 *   [{ type: "text", text: { content: "Click to expand" } }],
 *   { children: [hiddenContent] }
 * )
 */
export function buildToggleBlock(
  richText: RichTextItemRequest[],
  options?: {
    color?: ApiColor;
    children?: BlockWithChildren[];
  }
) {
  return {
    type: "toggle" as const,
    toggle: {
      rich_text: richText,
      ...(options?.color && { color: options.color }),
      ...(options?.children && { children: options.children }),
    },
  };
}

/**
 * Builds a quote block
 *
 * @param richText - Array of rich text items
 * @param options - Optional color and children
 * @returns Quote block payload
 *
 * @example
 * buildQuoteBlock([{ type: "text", text: { content: "To be or not to be" } }])
 */
export function buildQuoteBlock(
  richText: RichTextItemRequest[],
  options?: {
    color?: ApiColor;
    children?: BlockWithChildren[];
  }
) {
  return {
    type: "quote" as const,
    quote: {
      rich_text: richText,
      ...(options?.color && { color: options.color }),
      ...(options?.children && { children: options.children }),
    },
  };
}
