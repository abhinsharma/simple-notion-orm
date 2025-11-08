import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildRelationProperty } from "@/factories/properties/database-page";
import { z } from "zod";

export type RelationPropertyPayload = {
  relation: Array<{ id: string }>;
};

export type RelationPropertyResponse = {
  id?: string;
  type?: "relation";
  relation: Array<{
    id: string;
  }>;
};

type RelationReference = { id: string };

export const relationCodec = createNotionCodec<RelationReference[], RelationPropertyPayload, RelationPropertyResponse>(
  z.codec(
    z.array(
      z.object({
        id: z.string(),
      })
    ),
    z.custom<RelationPropertyPayload>(),
    {
      decode: (value: RelationReference[]): RelationPropertyPayload => {
        const { type: _type, ...payload } = buildRelationProperty(value);
        return payload;
      },
      encode: (property: RelationPropertyResponse): RelationReference[] => {
        return property.relation.map((rel) => ({
          id: rel.id,
        }));
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        relation: {},
      },
    };
  }
);
