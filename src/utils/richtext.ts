/**
 * Utility helpers for constructing Notion rich text payloads.
 * We only emit plain text items, so the shape aligns with Notion's
 * `TextRichTextItemRequest` + shared annotation fields.
 */

import type { ApiColor } from "@/types/blocks";

export type RichTextItemRequest = {
  type?: "text";
  text: {
    content: string;
    link?: {
      url: string;
    } | null;
  };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: ApiColor;
  };
  plain_text?: string;
  href?: string | null;
};

export function textToRichText(text: string): RichTextItemRequest[] {
  const trimmedText = text.trim();

  return [
    {
      type: "text",
      text: {
        content: trimmedText,
      },
    },
  ];
}

export function createRichTextItem(
  content: string,
  options?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: ApiColor;
    link?: string;
  }
): RichTextItemRequest {
  const base: RichTextItemRequest = {
    type: "text",
    text: {
      content: content.trim(),
    },
  };

  if (options?.link) {
    base.text = {
      content: base.text.content,
      link: { url: options.link },
    };
  }

  if (options && (options.bold || options.italic || options.strikethrough || options.underline || options.code || options.color)) {
    base.annotations = {
      bold: options.bold ?? false,
      italic: options.italic ?? false,
      strikethrough: options.strikethrough ?? false,
      underline: options.underline ?? false,
      code: options.code ?? false,
      color: options.color,
    };
  }

  return base;
}

export function isValidRichTextArray(richTextArray: RichTextItemRequest[]): boolean {
  if (!Array.isArray(richTextArray)) {
    return false;
  }

  if (richTextArray.length > 100) {
    return false;
  }

  return richTextArray.every((item) => item.type === "text" && Boolean(item.text));
}
