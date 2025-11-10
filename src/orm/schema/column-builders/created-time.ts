import { createdTimeCodec, type CreatedTimePropertyResponse } from "@/orm/codecs/timestamps/created-time";
import type { ColumnDef } from "../types";

type CreatedTimeColumnBuilder<TOptional extends boolean = true, TNullable extends boolean = false> = ColumnDef<
  string,
  TOptional,
  TNullable,
  never,
  CreatedTimePropertyResponse
> & {
  optional: () => CreatedTimeColumnBuilder<true, TNullable>;
  nullable: () => CreatedTimeColumnBuilder<TOptional, true>;
};

function buildCreatedTimeColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<string, TOptional, TNullable, never, CreatedTimePropertyResponse>
): CreatedTimeColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildCreatedTimeColumn({
        ...def,
        isOptional: true as const,
      }),
    nullable: () =>
      buildCreatedTimeColumn({
        ...def,
        isNullable: true as const,
      }),
  };
}

export function createdTime(name: string): CreatedTimeColumnBuilder {
  return buildCreatedTimeColumn({
    name,
    codec: createdTimeCodec,
    isOptional: true as const,
    isNullable: false as const,
    propertyType: "created_time",
    isReadOnly: true,
  });
}
