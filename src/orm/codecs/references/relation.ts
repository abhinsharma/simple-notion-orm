/**
 * Relation property codec (STUB)
 *
 * TODO: Implement relation codec for database page properties
 * - Schema: z.array(z.string()) for page IDs
 * - Encode: string[] → { relation: [{ id }] }
 * - Decode: Extract page IDs from property.relation
 * - Config: { [name]: { relation: { data_source_id } } }
 *
 * Note: Relation config requires target data_source_id
 * Decoding returns IDs by default; population is handled separately (ST-012)
 *
 * Reference:
 * - src/factories/properties/database-page.ts (buildRelationProperty)
 * - ai-docs/RFC Simplified Notion ORM.md (§4.4 Relation Handling)
 * - ai-docs/archives/Tech Design — ORM Relation Population.md
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const relationCodec = createNotionCodec(
  z.codec(
    z.array(z.string()),
    z.unknown(),
    {
      decode: () => {
        throw new Error("Relation codec not yet implemented");
      },
      encode: () => {
        throw new Error("Relation codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("Relation codec not yet implemented");
  }
);
