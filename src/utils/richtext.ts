/**
 * Utility functions for working with Notion RichText
 */

/**
 * RichTextItemRequest type from Notion SDK
 * Manually defined as it's not exported
 */
export interface RichTextItemRequest {
  type?: "text" | "mention" | "equation";
  text?: {
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
    color?: string;
  };
  mention?: unknown;
  equation?: {
    expression: string;
  };
}

/**
 * Converts a plain string to a Notion RichTextItemRequest array
 * Trims whitespace and handles empty strings
 *
 * @param text - The plain text string to convert
 * @returns Array of RichTextItemRequest objects
 *
 * @example
 * textToRichText("Hello World")
 * // Returns: [{ type: "text", text: { content: "Hello World" } }]
 *
 * textToRichText("")
 * // Returns: [{ type: "text", text: { content: "" } }]
 */
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

/**
 * Creates a single RichTextItemRequest with optional formatting
 *
 * @param content - The text content
 * @param options - Optional formatting options
 * @returns A single RichTextItemRequest object
 *
 * @example
 * createRichTextItem("Bold text", { bold: true })
 * // Returns: { type: "text", text: { content: "Bold text" }, annotations: { bold: true } }
 */
export function createRichTextItem(
  content: string,
  options?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
    link?: string;
  }
): RichTextItemRequest {
  const richText: RichTextItemRequest = {
    type: "text",
    text: {
      content: content.trim(),
    },
  };

  // Add link if provided
  if (options?.link) {
    richText.text = {
      content: richText.text?.content ?? content.trim(),
      link: { url: options.link },
    };
  }

  // Add annotations if any formatting is provided
  if (options && (options.bold || options.italic || options.strikethrough ||
      options.underline || options.code || options.color)) {
    richText.annotations = {
      bold: options.bold ?? false,
      italic: options.italic ?? false,
      strikethrough: options.strikethrough ?? false,
      underline: options.underline ?? false,
      code: options.code ?? false,
      color: options.color,
    };
  }

  return richText;
}

/**
 * Validates if a RichTextItemRequest array is valid
 * Notion has a limit of 100 rich text items per property
 *
 * @param richTextArray - Array of RichTextItemRequest objects
 * @returns True if valid, false otherwise
 */
export function isValidRichTextArray(richTextArray: RichTextItemRequest[]): boolean {
  if (!Array.isArray(richTextArray)) {
    return false;
  }

  if (richTextArray.length > 100) {
    return false;
  }

  return richTextArray.every(item => {
    if (!item.type) {
      return false;
    }

    if (item.type === "text" && !item.text) {
      return false;
    }

    if (item.type === "equation" && !item.equation) {
      return false;
    }

    return true;
  });
}
