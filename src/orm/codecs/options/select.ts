import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildSelectProperty } from "@/factories/properties/database-page";
import type { SelectOptionInput } from "@/types/properties";
import { z } from "zod";

export type SelectPropertyPayload = {
  select: SelectOptionInput | null;
};

export type SelectPropertyResponse = {
  id?: string;
  type?: "select";
  select: {
    id?: string;
    name?: string;
    color?: string;
  } | null;
};

export const selectCodec = createNotionCodec<SelectOptionInput | null, SelectPropertyPayload, SelectPropertyResponse>(
  z.codec(
    z.custom<SelectOptionInput>().nullable(),
    z.custom<SelectPropertyPayload>(),
    {
      decode: (value: SelectOptionInput | null): SelectPropertyPayload => {
        const { type: _type, ...payload } = buildSelectProperty(value);
        return payload;
      },
      encode: (property: SelectPropertyResponse): SelectOptionInput | null => {
        if (!property.select) {
          return null;
        }

        return property.select as SelectOptionInput;
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        select: {},
      },
    };
  }
);
