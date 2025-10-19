/**
 * Advanced block factories for Notion API
 * Includes code, callout, equation, synced blocks, and link-to-page
 */

import type { RichTextItemRequest, ApiColor, Language, IconType, LinkToPageType } from "@/types/blocks";

/**
 * Forward declaration for BlockObjectRequest to support children
 */
type BlockWithChildren = Record<string, unknown>;

/**
 * Builds a code block
 *
 * @param richText - Array of rich text items containing the code
 * @param language - Programming language for syntax highlighting
 * @param caption - Optional caption as rich text array
 * @returns Code block payload
 *
 * @example
 * buildCodeBlock(
 *   [{ type: "text", text: { content: "console.log('Hello');" } }],
 *   "javascript"
 * )
 * buildCodeBlock(
 *   [{ type: "text", text: { content: "SELECT * FROM users;" } }],
 *   "sql",
 *   [{ type: "text", text: { content: "Query all users" } }]
 * )
 */
export function buildCodeBlock(
  richText: RichTextItemRequest[],
  language: Language,
  caption?: RichTextItemRequest[]
) {
  return {
    type: "code" as const,
    code: {
      rich_text: richText,
      language,
      ...(caption && { caption }),
    },
  };
}

/**
 * Builds a callout block
 *
 * @param richText - Array of rich text items
 * @param options - Optional icon, color, and children
 * @returns Callout block payload
 *
 * @example
 * buildCalloutBlock(
 *   [{ type: "text", text: { content: "Important note" } }],
 *   { icon: { type: "emoji", emoji: "💡" }, color: "yellow_background" }
 * )
 */
export function buildCalloutBlock(
  richText: RichTextItemRequest[],
  options?: {
    icon?: IconType;
    color?: ApiColor;
    children?: BlockWithChildren[];
  }
) {
  return {
    type: "callout" as const,
    callout: {
      rich_text: richText,
      ...(options?.icon && { icon: options.icon }),
      ...(options?.color && { color: options.color }),
      ...(options?.children && { children: options.children }),
    },
  };
}

/**
 * Builds an equation block (LaTeX)
 *
 * @param expression - LaTeX expression
 * @returns Equation block payload
 *
 * @example
 * buildEquationBlock("E = mc^2")
 * buildEquationBlock("\\int_{a}^{b} x^2 dx")
 */
export function buildEquationBlock(expression: string) {
  return {
    type: "equation" as const,
    equation: {
      expression,
    },
  };
}

/**
 * Builds a synced block (original)
 *
 * @param children - Optional child blocks to sync
 * @returns Synced block payload
 *
 * @example
 * buildSyncedBlock([paragraphBlock, imageBlock])
 */
export function buildSyncedBlock(children?: BlockWithChildren[]) {
  return {
    type: "synced_block" as const,
    synced_block: {
      synced_from: null,
      ...(children && { children }),
    },
  };
}

/**
 * Builds a synced block reference (points to another synced block)
 *
 * @param blockId - ID of the original synced block to reference
 * @returns Synced block reference payload
 *
 * @example
 * buildSyncedBlockReference("abc123-def456-...")
 */
export function buildSyncedBlockReference(blockId: string) {
  return {
    type: "synced_block" as const,
    synced_block: {
      synced_from: {
        type: "block_id" as const,
        block_id: blockId,
      },
    },
  };
}

/**
 * Builds a link to page block
 *
 * @param link - Link configuration (page_id, database_id, or comment_id)
 * @returns Link to page block payload
 *
 * @example
 * buildLinkToPageBlock({ type: "page_id", page_id: "abc123..." })
 * buildLinkToPageBlock({ type: "database_id", database_id: "def456..." })
 */
export function buildLinkToPageBlock(link: LinkToPageType) {
  return {
    type: "link_to_page" as const,
    link_to_page: link,
  };
}

/**
 * Builds a template block
 *
 * @param richText - Array of rich text items
 * @param children - Optional child blocks
 * @returns Template block payload
 *
 * @example
 * buildTemplateBlock(
 *   [{ type: "text", text: { content: "Template content" } }],
 *   [paragraphBlock]
 * )
 */
export function buildTemplateBlock(
  richText: RichTextItemRequest[],
  children?: BlockWithChildren[]
) {
  return {
    type: "template" as const,
    template: {
      rich_text: richText,
      ...(children && { children }),
    },
  };
}
