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
export type NotionCodec<TAppValue, TPropertyPayload, TPropertyResponse> = {
  parse: (value: TAppValue) => TPropertyPayload;
  encode: (value: TPropertyResponse) => TAppValue;
  config: (name: string) => Record<string, unknown>;
};

/**
 * Create a Notion codec from a Zod codec and config function
 */
export function createNotionCodec<TAppValue, TPropertyPayload, TPropertyResponse>(
  zodCodec: z.ZodCodec<z.ZodTypeAny, z.ZodTypeAny>,
  configFn: (name: string) => Record<string, unknown>
): NotionCodec<TAppValue, TPropertyPayload, TPropertyResponse> {
  return {
    parse: (value: TAppValue) => zodCodec.parse(value) as TPropertyPayload,
    encode: (value: TPropertyResponse) => zodCodec.encode(value as unknown as TPropertyPayload) as TAppValue,
    config: configFn,
  };
}
