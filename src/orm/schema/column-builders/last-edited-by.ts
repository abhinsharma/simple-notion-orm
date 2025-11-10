import { lastEditedByCodec, type LastEditedByPropertyResponse, type UserReference } from "@/orm/codecs/references/user";
import type { ColumnDef } from "../types";

type LastEditedByColumnBuilder<TOptional extends boolean = true, TNullable extends boolean = false> = ColumnDef<
  UserReference,
  TOptional,
  TNullable,
  never,
  LastEditedByPropertyResponse
> & {
  optional: () => LastEditedByColumnBuilder<true, TNullable>;
  nullable: () => LastEditedByColumnBuilder<TOptional, true>;
};

function buildLastEditedByColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<UserReference, TOptional, TNullable, never, LastEditedByPropertyResponse>
): LastEditedByColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildLastEditedByColumn({
        ...def,
        isOptional: true as const,
      }),
    nullable: () =>
      buildLastEditedByColumn({
        ...def,
        isNullable: true as const,
      }),
  };
}

export function lastEditedBy(name: string): LastEditedByColumnBuilder {
  return buildLastEditedByColumn({
    name,
    codec: lastEditedByCodec,
    isOptional: true as const,
    isNullable: false as const,
    propertyType: "last_edited_by",
    isReadOnly: true,
  });
}
