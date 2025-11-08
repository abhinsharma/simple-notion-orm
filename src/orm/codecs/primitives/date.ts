import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildDateProperty } from "@/factories/properties/database-page";
import type { DatePropertyInput } from "@/types/properties";
import { z } from "zod";

export type DatePropertyPayload = {
  date: {
    start: string;
    end: string | null;
    time_zone: string | null;
  } | null;
};

export type DatePropertyResponse = {
  id?: string;
  type?: "date";
  date: {
    start: string;
    end?: string | null;
    time_zone?: string | null;
  } | null;
};

export const dateCodec = createNotionCodec<DatePropertyInput | null, DatePropertyPayload, DatePropertyResponse>(
  z.codec(
    z.custom<DatePropertyInput>().nullable(),
    z.custom<DatePropertyPayload>(),
    {
      decode: (value: DatePropertyInput | null): DatePropertyPayload => {
        const { type: _type, ...payload } = buildDateProperty(value);
        return payload;
      },
      encode: (property: DatePropertyResponse): DatePropertyInput | null => {
        if (!property.date) {
          return null;
        }

        return {
          start: property.date.start,
          end: property.date.end ?? undefined,
          time_zone: property.date.time_zone ?? undefined,
        };
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        date: {},
      },
    };
  }
);
