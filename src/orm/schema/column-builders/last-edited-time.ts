import { lastEditedTimeCodec, type LastEditedTimePropertyResponse } from "@/orm/codecs/timestamps/last-edited-time";
import type { ColumnDef } from "../types";

type LastEditedTimeColumnBuilder<TOptional extends boolean = true, TNullable extends boolean = false> = ColumnDef<
  string,
  TOptional,
  TNullable,
  never,
  LastEditedTimePropertyResponse
> & {
  optional: () => LastEditedTimeColumnBuilder<true, TNullable>;
  nullable: () => LastEditedTimeColumnBuilder<TOptional, true>;
};

function buildLastEditedTimeColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<string, TOptional, TNullable, never, LastEditedTimePropertyResponse>
): LastEditedTimeColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildLastEditedTimeColumn({
        ...def,
        isOptional: true as const,
      }),
    nullable: () =>
      buildLastEditedTimeColumn({
        ...def,
        isNullable: true as const,
      }),
  };
}

export function lastEditedTime(name: string): LastEditedTimeColumnBuilder {
  return buildLastEditedTimeColumn({
    name,
    codec: lastEditedTimeCodec,
    isOptional: true as const,
    isNullable: false as const,
    propertyType: "last_edited_time",
    isReadOnly: true,
  });
}
