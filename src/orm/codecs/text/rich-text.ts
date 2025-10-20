/**
 * Rich text property codec (STUB)
 *
 * TODO: Implement rich text codec for database page properties
 * - Schema: z.string() for plain text input
 * - Encode: string → { rich_text: RichTextItemRequest[] }
 * - Decode: Extract text from rich_text array
 * - Config: { [name]: { rich_text: {} } }
 *
 * Reference: src/factories/properties/database-page.ts (buildRichTextProperty)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const richTextCodec = createNotionCodec(
  z.codec(
    z.string(),
    z.unknown(),
    {
      decode: () => {
        throw new Error("Rich text codec not yet implemented");
      },
      encode: () => {
        throw new Error("Rich text codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("Rich text codec not yet implemented");
  }
);
