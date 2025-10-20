/**
 * URL property codec (STUB)
 *
 * TODO: Implement URL codec for database page properties
 * - Schema: z.string().url().nullable() with trimming
 * - Encode: string | null → { url: string | null }
 * - Decode: Extract URL from property.url
 * - Config: { [name]: { url: {} } }
 *
 * Reference: src/factories/properties/database-page.ts (buildUrlProperty)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const urlCodec = createNotionCodec(
  z.codec(
    z.string().url().nullable(),
    z.unknown(),
    {
      decode: () => {
        throw new Error("URL codec not yet implemented");
      },
      encode: () => {
        throw new Error("URL codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("URL codec not yet implemented");
  }
);
