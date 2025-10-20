/**
 * Multi-select property codec (STUB)
 *
 * TODO: Implement multi-select codec for database page properties
 * - Schema: z.array(z.object({ name?, id? })) or z.array(z.string())
 * - Encode: SelectOption[] → { multi_select: [{ name?, id? }] }
 * - Decode: Extract options array from property.multi_select
 * - Config: { [name]: { multi_select: { options: [...] } } }
 *
 * Note: Handle empty array and option normalization
 *
 * Reference: src/factories/properties/database-page.ts (buildMultiSelectProperty)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const multiSelectCodec = createNotionCodec(
  z.codec(
    z.array(z.unknown()),
    z.unknown(),
    {
      decode: () => {
        throw new Error("Multi-select codec not yet implemented");
      },
      encode: () => {
        throw new Error("Multi-select codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("Multi-select codec not yet implemented");
  }
);
