import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildStatusProperty } from "@/factories/properties/database-page";
import type { SelectOptionInput } from "@/types/properties";
import { z } from "zod";

export type StatusPropertyPayload = {
  status: SelectOptionInput | null;
};

export type StatusPropertyResponse = {
  id?: string;
  type?: "status";
  status: {
    id?: string;
    name?: string;
    color?: string;
  } | null;
};

export const statusCodec = createNotionCodec<SelectOptionInput | null, StatusPropertyPayload, StatusPropertyResponse>(
  z.codec(
    z.custom<SelectOptionInput>().nullable(),
    z.custom<StatusPropertyPayload>(),
    {
      decode: (value: SelectOptionInput | null): StatusPropertyPayload => {
        const { type: _type, ...payload } = buildStatusProperty(value);
        return payload;
      },
      encode: (property: StatusPropertyResponse): SelectOptionInput | null => {
        if (!property.status) {
          return null;
        }

        return property.status as SelectOptionInput;
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        status: {},
      },
    };
  }
);
