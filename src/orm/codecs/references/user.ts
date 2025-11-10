import { createNotionCodec } from "@/orm/codecs/base/codec";
import { z } from "zod";

export type UserReference = {
  id: string;
};

export type CreatedByPropertyResponse = {
  id?: string;
  type?: "created_by";
  created_by: {
    id: string;
    object?: "user";
  } | null;
};

export type LastEditedByPropertyResponse = {
  id?: string;
  type?: "last_edited_by";
  last_edited_by: {
    id: string;
    object?: "user";
  } | null;
};

const READ_ONLY_CREATED_BY_ERROR = "created_by properties are read-only and cannot be set.";
const READ_ONLY_LAST_EDITED_BY_ERROR = "last_edited_by properties are read-only and cannot be set.";

export const createdByCodec = createNotionCodec<UserReference, never, CreatedByPropertyResponse>(
  z.codec(z.custom<UserReference>(), z.custom<never>(), {
    decode: () => {
      throw new Error(READ_ONLY_CREATED_BY_ERROR);
    },
    encode: (property: CreatedByPropertyResponse): UserReference => {
      return {
        id: property.created_by?.id ?? "",
      };
    },
  }),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        created_by: {},
      },
    };
  }
);

export const lastEditedByCodec = createNotionCodec<UserReference, never, LastEditedByPropertyResponse>(
  z.codec(z.custom<UserReference>(), z.custom<never>(), {
    decode: () => {
      throw new Error(READ_ONLY_LAST_EDITED_BY_ERROR);
    },
    encode: (property: LastEditedByPropertyResponse): UserReference => {
      return {
        id: property.last_edited_by?.id ?? "",
      };
    },
  }),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        last_edited_by: {},
      },
    };
  }
);
