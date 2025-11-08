import { selectCodec } from "@/orm/codecs";
import type { SelectPropertyPayload, SelectPropertyResponse } from "@/orm/codecs/options/select";
import type { SelectOptionInput } from "@/types/properties";
import type { ColumnDef } from "../types";

type SelectValue = SelectOptionInput | null;

type SelectColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  SelectValue,
  TOptional,
  TNullable,
  SelectPropertyPayload,
  SelectPropertyResponse
> & {
  optional: () => SelectColumnBuilder<true, TNullable>;
  nullable: () => SelectColumnBuilder<TOptional, true>;
  default: (value: SelectValue) => SelectColumnBuilder<TOptional, TNullable>;
};

function buildSelectColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<SelectValue, TOptional, TNullable, SelectPropertyPayload, SelectPropertyResponse>
): SelectColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildSelectColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
      }),
    nullable: () =>
      buildSelectColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
      }),
    default: (value: SelectValue) =>
      buildSelectColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
      }),
  };
}

export function select(name: string): SelectColumnBuilder {
  return buildSelectColumn({
    name,
    codec: selectCodec,
    isOptional: false as const,
    isNullable: false as const,
  });
}
