import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildNumberProperty } from "@/factories/properties/database-page";
import { z } from "zod";

export type NumberPropertyPayload = {
  number: number | null;
};

export type NumberPropertyResponse = {
  id?: string;
  type?: "number";
  number: number | null;
};

export const numberCodec = createNotionCodec(
  z.codec(
    z.number().nullable(),
    z.custom<NumberPropertyPayload>(),
    {
      decode: (value: number | null): NumberPropertyPayload => {
        const { type: _type, ...payload } = buildNumberProperty(value);
        return payload;
      },
      encode: (property: NumberPropertyResponse): number | null => {
        return property.number;
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        number: {},
      },
    };
  }
);
