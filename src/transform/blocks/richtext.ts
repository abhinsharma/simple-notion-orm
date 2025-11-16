import type { ApiColor } from "@/types/blocks";
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import type { NonDefaultColor, SimpleAnnotations, SimpleRichTextSpan } from "./types";

export function toSimpleRichTextSpanArray(richText: RichTextItemResponse[]): SimpleRichTextSpan[] {
  return richText
    .map((item) => toSimpleRichTextSpan(item))
    .filter((span): span is SimpleRichTextSpan => Boolean(span));
}

function toSimpleRichTextSpan(item: RichTextItemResponse): SimpleRichTextSpan | null {
  const plainText = (item.plain_text ?? "").trim();
  const href = item.href ?? (item.type === "text" ? item.text.link?.url ?? null : null);

  if (!plainText && !href) {
    return null;
  }

  const annotations = normalizeAnnotations(item.annotations);
  const span: SimpleRichTextSpan = {
    plainText,
  };

  if (href) {
    span.href = href;
  }

  if (annotations) {
    span.annotations = annotations;
  }

  return span;
}

function normalizeAnnotations(input: RichTextItemResponse["annotations"]): SimpleAnnotations | undefined {
  const result: SimpleAnnotations = {};

  if (input.bold) result.bold = true;
  if (input.italic) result.italic = true;
  if (input.underline) result.underline = true;
  if (input.strikethrough) result.strikethrough = true;
  if (input.code) result.code = true;

  const color = normalizeColor(input.color as ApiColor);
  if (color) {
    result.color = color;
  }

  return Object.keys(result).length ? result : undefined;
}

export function normalizeColor(color?: ApiColor | NonDefaultColor): NonDefaultColor | undefined {
  if (!color || color === "default") {
    return undefined;
  }

  return color as NonDefaultColor;
}
