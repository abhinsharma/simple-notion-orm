import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export type CreatedTimePropertyResponse = {
  id?: string;
  type?: "created_time";
  created_time: string;
};

const READ_ONLY_ERROR = "created_time properties are read-only and cannot be set.";

export const createdTimeCodec = createNotionCodec<string, never, CreatedTimePropertyResponse>(
  z.codec(z.string(), z.custom<never>(), {
    decode: () => {
      throw new Error(READ_ONLY_ERROR);
    },
    encode: (property: CreatedTimePropertyResponse): string => {
      return property.created_time;
    },
  }),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        created_time: {},
      },
    };
  }
);
