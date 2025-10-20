/**
 * Date property codec (STUB)
 *
 * TODO: Implement date codec for database page properties
 * - Schema: z.object({ start, end?, time_zone? }).nullable()
 * - Encode: DateInput → { date: { start, end?, time_zone? } | null }
 * - Decode: Extract date object from property.date
 * - Config: { [name]: { date: {} } }
 *
 * Reference: src/factories/properties/database-page.ts (buildDateProperty)
 * Type: src/types/properties.ts (DatePropertyInput)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const dateCodec = createNotionCodec(
  z.codec(
    z.unknown(),
    z.unknown(),
    {
      decode: () => {
        throw new Error("Date codec not yet implemented");
      },
      encode: () => {
        throw new Error("Date codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("Date codec not yet implemented");
  }
);
