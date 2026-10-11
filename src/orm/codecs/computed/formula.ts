import { createNotionCodec } from "@/orm/codecs/base/codec";
import type { DatePropertyInput } from "@/types/properties";
import { z } from "zod";

export type FormulaValue = string | number | boolean | DatePropertyInput | null;

export type FormulaPropertyResponse = {
  id?: string;
  type?: "formula";
  formula:
    | { type: "string"; string: string | null }
    | { type: "number"; number: number | null }
    | { type: "boolean"; boolean: boolean | null }
    | { type: "date"; date: { start: string; end?: string | null; time_zone?: string | null } | null }
    | { type: "unsupported"; unsupported?: Record<string, never> };
};

const READ_ONLY_ERROR = "formula properties are read-only and cannot be set.";

export const formulaCodec = createNotionCodec<FormulaValue, never, FormulaPropertyResponse>(
  z.codec(z.custom<FormulaValue>(), z.custom<never>(), {
    decode: () => {
      throw new Error(READ_ONLY_ERROR);
    },
    encode: (property: FormulaPropertyResponse): FormulaValue => {
      const result = property.formula;
      switch (result.type) {
        case "string":
          return result.string;
        case "number":
          return result.number;
        case "boolean":
          return result.boolean;
        case "date":
          if (!result.date) {
            return null;
          }
          return {
            start: result.date.start,
            end: result.date.end ?? undefined,
            time_zone: result.date.time_zone ?? undefined,
          };
        default:
          return null;
      }
    },
  }),
  (name: string): Record<string, unknown> => {
    throw new Error(`Formula column '${name}' needs an expression to create a database. Use formula(name, { expression }).`);
  }
);
