/**
 * Title property codec
 *
 * Provides validation, encoding, and decoding for Notion title properties.
 * Title is the primary property type for both standalone pages and database pages.
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { textToRichText, type RichTextItemRequest } from "@/utils/richtext";
import { z } from "zod";

/**
 * Notion title property payload structure
 */
export type TitlePropertyPayload = {
  title: RichTextItemRequest[];
};

/**
 * Notion title property response structure (from API)
 */
export type TitlePropertyResponse = {
  id?: string;
  type?: "title";
  title: Array<{
    type?: "text";
    text?: {
      content: string;
      link?: { url: string } | null;
    };
    annotations?: {
      bold?: boolean;
      italic?: boolean;
      strikethrough?: boolean;
      underline?: boolean;
      code?: boolean;
      color?: string;
    };
    plain_text?: string;
    href?: string | null;
  }>;
};

/**
 * Extract plain text from Notion rich text array
 *
 * @param richTextArray - Array of rich text items from Notion API
 * @returns Concatenated plain text content
 */
function extractTextFromRichText(richTextArray: TitlePropertyResponse["title"]): string {
  if (!Array.isArray(richTextArray)) {
    return "";
  }

  return richTextArray.map((block) => block.text?.content ?? block.plain_text ?? "").join("");
}

/**
 * Title codec for ORM property transformations
 *
 * Built with Zod's z.codec() for validation and bi-directional transformations.
 *
 * App type: string
 * Notion type: { title: RichTextItemRequest[] }
 *
 * @example
 * ```ts
 * // Encode (parse)
 * const payload = titleCodec.parse("My Page Title");
 * // => { title: [{ type: "text", text: { content: "My Page Title" } }] }
 *
 * // Decode (encode)
 * const value = titleCodec.encode({ title: [...] });
 * // => "My Page Title"
 *
 * // Config
 * const config = titleCodec.config("Name");
 * // => { Name: { title: {} } }
 * ```
 */
export const titleCodec = createNotionCodec(
  z.codec(
    // Schema: string (validation happens in decode function)
    z.string(),
    // Output schema (Notion property payload shape)
    z.custom<TitlePropertyPayload>(),
    {
      // Decode: string → Notion title property payload (app → Notion)
      decode: (value: string): TitlePropertyPayload => {
        const content = value.trim();
        // Validate non-empty after trimming
        if (content.length === 0) {
          throw new Error("Title cannot be empty");
        }
        return {
          title: textToRichText(content),
        };
      },
      // Encode: Notion title property → string (Notion → app)
      encode: (property: TitlePropertyResponse): string => {
        return extractTextFromRichText(property.title);
      },
    }
  ),
  // Config: Generate title property configuration for database schema
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        title: {},
      },
    };
  }
);
