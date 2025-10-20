/**
 * Checkbox property codec (STUB)
 *
 * TODO: Implement checkbox codec for database page properties
 * - Schema: z.boolean()
 * - Encode: boolean → { checkbox: boolean }
 * - Decode: Extract boolean from property.checkbox
 * - Config: { [name]: { checkbox: {} } }
 *
 * Reference: src/factories/properties/database-page.ts (buildCheckboxProperty)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const checkboxCodec = createNotionCodec(
  z.codec(
    z.boolean(),
    z.unknown(),
    {
      decode: () => {
        throw new Error("Checkbox codec not yet implemented");
      },
      encode: () => {
        throw new Error("Checkbox codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("Checkbox codec not yet implemented");
  }
);
