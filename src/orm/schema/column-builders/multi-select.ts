import { multiSelectCodec } from "@/orm/codecs";
import type {
  MultiSelectPropertyPayload,
  MultiSelectPropertyResponse,
} from "@/orm/codecs/options/multi-select";
import type { SelectOptionInput } from "@/types/properties";
import type { ColumnDef } from "../types";

type MultiSelectValue = SelectOptionInput[];

type MultiSelectColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  MultiSelectValue,
  TOptional,
  TNullable,
  MultiSelectPropertyPayload,
  MultiSelectPropertyResponse
> & {
  optional: () => MultiSelectColumnBuilder<true, TNullable>;
  nullable: () => MultiSelectColumnBuilder<TOptional, true>;
  default: (value: MultiSelectValue) => MultiSelectColumnBuilder<TOptional, TNullable>;
};

function buildMultiSelectColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<
    MultiSelectValue,
    TOptional,
    TNullable,
    MultiSelectPropertyPayload,
    MultiSelectPropertyResponse
  >
): MultiSelectColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildMultiSelectColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
      }),
    nullable: () =>
      buildMultiSelectColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
      }),
    default: (value: MultiSelectValue) =>
      buildMultiSelectColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
      }),
  };
}

export function multiSelect(name: string): MultiSelectColumnBuilder {
  return buildMultiSelectColumn({
    name,
    codec: multiSelectCodec,
    isOptional: false as const,
    isNullable: false as const,
  });
}
