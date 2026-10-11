import { createNotionCodec, type NotionCodec } from "@/orm/codecs/base/codec";
import type { DatePropertyInput } from "@/types/properties";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints.js";
import { z } from "zod";

export type RollupPropertyResponse = Extract<PageObjectResponse["properties"][string], { type: "rollup" }>;

type RollupResult = RollupPropertyResponse["rollup"];

/** Raw property values that an array rollup collects from the related pages. */
export type RollupArrayItem = Extract<RollupResult, { type: "array" }>["array"][number];

/**
 * Decoded rollup value. The shape depends on the rollup function configured in Notion.
 */
export type RollupValue =
  | { type: "number"; function: RollupResult["function"]; number: number | null }
  | { type: "date"; function: RollupResult["function"]; date: DatePropertyInput | null }
  | { type: "array"; function: RollupResult["function"]; array: RollupArrayItem[] }
  | { type: "unsupported"; function: RollupResult["function"] };

const READ_ONLY_ERROR = "rollup properties are read-only and cannot be set.";

export const rollupCodec: NotionCodec<RollupValue, never, RollupPropertyResponse> = createNotionCodec<RollupValue, never, RollupPropertyResponse>(
  z.codec(z.custom<RollupValue>(), z.custom<never>(), {
    decode: () => {
      throw new Error(READ_ONLY_ERROR);
    },
    encode: (property: RollupPropertyResponse): RollupValue => {
      const result = property.rollup;
      switch (result.type) {
        case "number":
          return { type: "number", function: result.function, number: result.number };
        case "date":
          return {
            type: "date",
            function: result.function,
            date: result.date ? { start: result.date.start, end: result.date.end ?? undefined, time_zone: result.date.time_zone ?? undefined } : null,
          };
        case "array":
          return { type: "array", function: result.function, array: result.array };
        default:
          return { type: "unsupported", function: result.function };
      }
    },
  }),
  (name: string): Record<string, unknown> => {
    throw new Error(`Rollup column '${name}' can only read existing databases. Add the rollup in Notion or with updateDatabase after linking relations.`);
  }
);
