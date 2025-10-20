/**
 * Status property codec (STUB)
 *
 * TODO: Implement status codec for database page properties
 * - Schema: z.object({ name?, id? }) or z.string() for option name
 * - Encode: StatusOption → { status: { name?, id? } }
 * - Decode: Extract option from property.status
 * - Config: { [name]: { status: {} } } - NOTE: Do NOT include options in config
 *
 * ⚠️ IMPORTANT: Status column limitations
 * - Notion's REST API does NOT support status property creation during database creation
 * - Codec supports validation/encode/decode, but config must omit options
 * - Database sync will warn when status properties cannot be provisioned
 * - Future enhancement (ST-019): Two-phase provisioning (create DB, then update status)
 *
 * Reference:
 * - src/factories/properties/database-page.ts (buildStatusProperty)
 * - ai-docs/RFC Simplified Notion ORM.md (§4.3 Status Column Handling)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const statusCodec = createNotionCodec(
  z.codec(
    z.unknown(),
    z.unknown(),
    {
      decode: () => {
        throw new Error("Status codec not yet implemented");
      },
      encode: () => {
        throw new Error("Status codec not yet implemented");
      },
    }
  ),
  (name: string) => {
    // Status config does NOT include options due to API limitations
    // See ai-docs/RFC Simplified Notion ORM.md §4.3
    return {
      [name]: {
        status: {},
      },
    };
  }
);
