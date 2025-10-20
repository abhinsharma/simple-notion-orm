/**
 * Select property codec (STUB)
 *
 * TODO: Implement select codec for database page properties
 * - Schema: z.object({ name?, id? }) or z.string() for option name
 * - Encode: SelectOption → { select: { name?, id? } }
 * - Decode: Extract option from property.select
 * - Config: { [name]: { select: { options: [...] } } }
 *
 * Note: Include option normalization helper (by name or ID)
 *
 * Reference: src/factories/properties/database-page.ts (buildSelectProperty)
 * Type: src/types/properties.ts (SelectOptionInput)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const selectCodec = createNotionCodec(
  z.codec(
    z.unknown(),
    z.unknown(),
    {
      decode: () => {
        throw new Error("Select codec not yet implemented");
      },
      encode: () => {
        throw new Error("Select codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("Select codec not yet implemented");
  }
);
