import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildEmailProperty } from "@/factories/properties/database-page";
import { z } from "zod";

export type EmailPropertyPayload = {
  email: string | null;
};

export type EmailPropertyResponse = {
  id?: string;
  type?: "email";
  email: string | null;
};

export const emailCodec = createNotionCodec<string | null, EmailPropertyPayload, EmailPropertyResponse>(
  z.codec(z.string().trim().email().nullable(), z.custom<EmailPropertyPayload>(), {
    decode: (value: string | null): EmailPropertyPayload => {
      const { type: _type, ...payload } = buildEmailProperty(value);
      return payload;
    },
    encode: (property: EmailPropertyResponse): string | null => {
      return property.email;
    },
  }),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        email: {},
      },
    };
  }
);
