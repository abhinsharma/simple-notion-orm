import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildPhoneNumberProperty } from "@/factories/properties/database-page";
import { z } from "zod";

export type PhoneNumberPropertyPayload = {
  phone_number: string | null;
};

export type PhoneNumberPropertyResponse = {
  id?: string;
  type?: "phone_number";
  phone_number: string | null;
};

export const phoneNumberCodec = createNotionCodec<
  string | null,
  PhoneNumberPropertyPayload,
  PhoneNumberPropertyResponse
>(
  z.codec(
    z.string().trim().min(1).nullable(),
    z.custom<PhoneNumberPropertyPayload>(),
    {
      decode: (value: string | null): PhoneNumberPropertyPayload => {
        const { type: _type, ...payload } = buildPhoneNumberProperty(value);
        return payload;
      },
      encode: (property: PhoneNumberPropertyResponse): string | null => {
        return property.phone_number;
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        phone_number: {},
      },
    };
  }
);
