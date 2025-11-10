import { uniqueIdCodec, type UniqueIdValue, type UniqueIdPropertyResponse } from "@/orm/codecs/options/unique-id";
import { buildUniqueIdColumn } from "@/factories/properties/database-schema";
import type { ColumnDef } from "../types";

type UniqueIdColumnBuilder<TOptional extends boolean = true, TNullable extends boolean = false> = ColumnDef<
  UniqueIdValue,
  TOptional,
  TNullable,
  never,
  UniqueIdPropertyResponse
> & {
  optional: () => UniqueIdColumnBuilder<true, TNullable>;
  nullable: () => UniqueIdColumnBuilder<TOptional, true>;
};

function buildUniqueIdColumnBuilder<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<UniqueIdValue, TOptional, TNullable, never, UniqueIdPropertyResponse>
): UniqueIdColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildUniqueIdColumnBuilder({
        ...def,
        isOptional: true as const,
      }),
    nullable: () =>
      buildUniqueIdColumnBuilder({
        ...def,
        isNullable: true as const,
      }),
  };
}

export function uniqueId(name: string, options?: { prefix?: string | null }): UniqueIdColumnBuilder {
  return buildUniqueIdColumnBuilder({
    name,
    codec: uniqueIdCodec,
    isOptional: true as const,
    isNullable: false as const,
    propertyType: "unique_id",
    isReadOnly: true,
    config: () => ({
      [name]: buildUniqueIdColumn(options?.prefix ?? null),
    }),
  });
}
