import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildMultiSelectProperty } from "@/factories/properties/database-page";
import type { SelectOptionInput } from "@/types/properties";
import { z } from "zod";

export type MultiSelectPropertyPayload = {
  multi_select: SelectOptionInput[];
};

export type MultiSelectPropertyResponse = {
  id?: string;
  type?: "multi_select";
  multi_select: Array<{
    id?: string;
    name?: string;
    color?: string;
  }>;
};

export const multiSelectCodec = createNotionCodec<SelectOptionInput[], MultiSelectPropertyPayload, MultiSelectPropertyResponse>(
  z.codec(z.array(z.custom<SelectOptionInput>()), z.custom<MultiSelectPropertyPayload>(), {
    decode: (value: SelectOptionInput[]): MultiSelectPropertyPayload => {
      const { type: _type, ...payload } = buildMultiSelectProperty(value);
      return payload;
    },
    encode: (property: MultiSelectPropertyResponse): SelectOptionInput[] => {
      return property.multi_select as SelectOptionInput[];
    },
  }),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        multi_select: {},
      },
    };
  }
);
