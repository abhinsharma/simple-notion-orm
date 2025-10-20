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

export const relationCodec = createNotionCodec(
  z.codec(
    z.array(z.string()),
    z.custom<RelationPropertyPayload>(),
    {
      decode: (value: string[]): RelationPropertyPayload => {
        const { type: _type, ...payload } = buildRelationProperty(value);
        return payload;
      },
      encode: (property: RelationPropertyResponse): string[] => {
        return property.relation.map((rel) => rel.id);
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
