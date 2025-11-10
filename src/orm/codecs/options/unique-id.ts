import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export type UniqueIdValue = {
  number: number;
  prefix: string | null;
  value: string;
};

export type UniqueIdPropertyResponse = {
  id?: string;
  type?: "unique_id";
  unique_id: {
    number: number;
    prefix?: string | null;
  } | null;
};

const READ_ONLY_ERROR = "unique_id properties are read-only and cannot be set.";

export const uniqueIdCodec = createNotionCodec<UniqueIdValue, never, UniqueIdPropertyResponse>(
  z.codec(z.custom<UniqueIdValue>(), z.custom<never>(), {
    decode: () => {
      throw new Error(READ_ONLY_ERROR);
    },
    encode: (property: UniqueIdPropertyResponse): UniqueIdValue => {
      const number = property.unique_id?.number ?? 0;
      const prefix = property.unique_id?.prefix ?? null;
      const value = prefix ? `${prefix}-${number}` : String(number);

      return {
        number,
        prefix,
        value,
      };
    },
  }),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        unique_id: {
          prefix: null,
        },
      },
    };
  }
);
