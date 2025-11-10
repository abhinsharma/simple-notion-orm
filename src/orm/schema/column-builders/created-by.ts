import { createdByCodec, type CreatedByPropertyResponse, type UserReference } from "@/orm/codecs/references/user";
import type { ColumnDef } from "../types";

type CreatedByColumnBuilder<TOptional extends boolean = true, TNullable extends boolean = false> = ColumnDef<
  UserReference,
  TOptional,
  TNullable,
  never,
  CreatedByPropertyResponse
> & {
  optional: () => CreatedByColumnBuilder<true, TNullable>;
  nullable: () => CreatedByColumnBuilder<TOptional, true>;
};

function buildCreatedByColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<UserReference, TOptional, TNullable, never, CreatedByPropertyResponse>
): CreatedByColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildCreatedByColumn({
        ...def,
        isOptional: true as const,
      }),
    nullable: () =>
      buildCreatedByColumn({
        ...def,
        isNullable: true as const,
      }),
  };
}

export function createdBy(name: string): CreatedByColumnBuilder {
  return buildCreatedByColumn({
    name,
    codec: createdByCodec,
    isOptional: true as const,
    isNullable: false as const,
    propertyType: "created_by",
    isReadOnly: true,
  });
}
