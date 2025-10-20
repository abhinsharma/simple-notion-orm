/**
 * People property codec (STUB)
 *
 * TODO: Implement people codec for database page properties
 * - Schema: z.array(z.object({ id, object: "user" })) or z.array(z.string()) for user IDs
 * - Encode: UserInput[] → { people: [{ id, object: "user" }] }
 * - Decode: Extract user array from property.people
 * - Config: { [name]: { people: {} } }
 *
 * Note: Support both user objects and group objects (type: "user" | "group")
 *
 * Reference: src/factories/properties/database-page.ts (buildPeopleProperty)
 * Types: src/types/properties.ts (UserInput, GroupInput)
 */

import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export const peopleCodec = createNotionCodec(
  z.codec(
    z.array(z.unknown()),
    z.unknown(),
    {
      decode: () => {
        throw new Error("People codec not yet implemented");
      },
      encode: () => {
        throw new Error("People codec not yet implemented");
      },
    }
  ),
  () => {
    throw new Error("People codec not yet implemented");
  }
);
