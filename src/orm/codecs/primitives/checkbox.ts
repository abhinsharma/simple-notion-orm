import { createNotionCodec } from "@/orm/codecs/base/codec";
import { buildCheckboxProperty } from "@/factories/properties/database-page";
import { z } from "zod";

export type CheckboxPropertyPayload = {
  checkbox: boolean;
};

export type CheckboxPropertyResponse = {
  id?: string;
  type?: "checkbox";
  checkbox: boolean;
};

export const checkboxCodec = createNotionCodec(
  z.codec(
    z.boolean(),
    z.custom<CheckboxPropertyPayload>(),
    {
      decode: (value: boolean): CheckboxPropertyPayload => {
        const { type: _type, ...payload } = buildCheckboxProperty(value);
        return payload;
      },
      encode: (property: CheckboxPropertyResponse): boolean => {
        return property.checkbox;
      },
    }
  ),
  (name: string): Record<string, unknown> => {
    return {
      [name]: {
        checkbox: {},
      },
    };
  }
);
