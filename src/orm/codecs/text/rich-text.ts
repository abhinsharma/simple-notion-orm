import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildRichTextProperty } from "@/factories/properties/database-page";
import { type RichTextItemRequest } from "@/utils/richtext";
import { z } from "zod";

export type RichTextPropertyPayload = {
  rich_text: RichTextItemRequest[];
};

export type RichTextPropertyResponse = {
  id?: string;
  type?: "rich_text";
  rich_text: Array<{
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

function extractTextFromRichText(richTextArray: RichTextPropertyResponse["rich_text"]): string {
  if (!Array.isArray(richTextArray)) {
    return "";
  }

  return richTextArray.map((block) => block.text?.content ?? block.plain_text ?? "").join("");
}

export const richTextCodec = createNotionCodec<string, RichTextPropertyPayload, RichTextPropertyResponse>(
  z.codec(z.string(), z.custom<RichTextPropertyPayload>(), {
    decode: (value: string): RichTextPropertyPayload => {
      const { type: _type, ...payload } = buildRichTextProperty(value.trim());
      return payload;
    },
    encode: (property: RichTextPropertyResponse): string => {
      return extractTextFromRichText(property.rich_text);
    },
  }),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        rich_text: {},
      },
    };
  }
);
