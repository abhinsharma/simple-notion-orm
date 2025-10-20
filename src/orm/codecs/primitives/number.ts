/**
 * Number property codec (STUB)
 *
 * TODO: Implement number codec for database page properties
 * - Schema: z.number().nullable() to support clearing
 * - Encode: number | null → { number: number | null }
 * - Decode: Extract number from property.number
 * - Config: { [name]: { number: {} } }
 *
 * Reference: src/factories/properties/database-page.ts (buildNumberProperty)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const numberCodec = createNotionCodec(
  z.codec(
    z.number().nullable(),
    z.unknown(),
    {
      decode: () => {
        throw new Error("Number codec not yet implemented");
      },
      encode: () => {
        throw new Error("Number codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("Number codec not yet implemented");
  }
);
