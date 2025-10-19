/**
 * Common page property factories for Notion API
 * These functions work for both database pages and standalone pages
 */

import { textToRichText } from "@/utils/richtext";

/**
 * Builds a title property value
 * Title is the primary property for pages (both database and standalone)
 *
 * @param text - The title text
 * @returns Title property payload
 *
 * @example
 * buildTitleProperty("My Page Title")
 */
export function buildTitleProperty(text: string) {
  return {
    type: "title" as const,
    title: textToRichText(text),
  };
}
