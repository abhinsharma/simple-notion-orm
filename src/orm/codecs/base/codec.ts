/**
 * Base codec infrastructure for ORM property type conversions
 *
 * Codecs provide bi-directional mappings between app-layer values and Notion property payloads.
 * Uses Zod's built-in codec functionality (z.codec) for validation and transformations.
 */

import { type z } from "zod";

/**
 * Notion codec with validation, encoding/decoding, and config generation
 */
export type NotionCodec = {
  parse: (value: unknown) => unknown;
  decode: (value: unknown) => unknown;
  encode: (value: unknown) => unknown;
  config: (name: string) => Record<string, unknown>;
};

/**
 * Create a Notion codec from a Zod codec and config function
 */
export function createNotionCodec(
  zodCodec: z.ZodCodec<z.ZodTypeAny, z.ZodTypeAny>,
  configFn: (name: string) => Record<string, unknown>
): NotionCodec {
  return {
    parse: (value: unknown) => zodCodec.parse(value),
    decode: (value: unknown) => zodCodec.decode(value),
    encode: (value: unknown) => zodCodec.encode(value),
    config: configFn,
  };
}
