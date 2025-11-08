import { urlCodec } from "@/orm/codecs";
import type { UrlPropertyPayload, UrlPropertyResponse } from "@/orm/codecs/primitives/url";
import type { ColumnDef } from "../types";

type UrlColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  string | null,
  TOptional,
  TNullable,
  UrlPropertyPayload,
  UrlPropertyResponse
> & {
  optional: () => UrlColumnBuilder<true, TNullable>;
  nullable: () => UrlColumnBuilder<TOptional, true>;
  default: (value: string | null) => UrlColumnBuilder<TOptional, TNullable>;
};

function buildUrlColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<string | null, TOptional, TNullable, UrlPropertyPayload, UrlPropertyResponse>
): UrlColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildUrlColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
      }),
    nullable: () =>
      buildUrlColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
      }),
    default: (value: string | null) =>
      buildUrlColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
      }),
  };
}

export function url(name: string): UrlColumnBuilder {
  return buildUrlColumn({
    name,
    codec: urlCodec,
    isOptional: false as const,
    isNullable: false as const,
  });
}
