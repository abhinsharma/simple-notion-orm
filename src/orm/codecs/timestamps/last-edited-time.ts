import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export type LastEditedTimePropertyResponse = {
  id?: string;
  type?: "last_edited_time";
  last_edited_time: string;
};

const READ_ONLY_ERROR = "last_edited_time properties are read-only and cannot be set.";

export const lastEditedTimeCodec = createNotionCodec<string, never, LastEditedTimePropertyResponse>(
  z.codec(z.string(), z.custom<never>(), {
    decode: () => {
      throw new Error(READ_ONLY_ERROR);
    },
    encode: (property: LastEditedTimePropertyResponse): string => {
      return property.last_edited_time;
    },
  }),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        last_edited_time: {},
      },
    };
  }
);
