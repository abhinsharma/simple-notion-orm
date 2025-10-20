import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildUrlProperty } from "@/factories/properties/database-page";
import { z } from "zod";

export type UrlPropertyPayload = {
  url: string | null;
};

export type UrlPropertyResponse = {
  id?: string;
  type?: "url";
  url: string | null;
};

export const urlCodec = createNotionCodec(
  z.codec(
    z.string().nullable(),
    z.custom<UrlPropertyPayload>(),
    {
      decode: (value: string | null): UrlPropertyPayload => {
        const { type: _type, ...payload } = buildUrlProperty(value);
        return payload;
      },
      encode: (property: UrlPropertyResponse): string | null => {
        return property.url;
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        url: {},
      },
    };
  }
);
