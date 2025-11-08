import { numberCodec } from "@/orm/codecs";
import type { NumberPropertyPayload, NumberPropertyResponse } from "@/orm/codecs/primitives/number";
import type { ColumnDef } from "../types";

type NumberColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  number | null,
  TOptional,
  TNullable,
  NumberPropertyPayload,
  NumberPropertyResponse
> & {
  optional: () => NumberColumnBuilder<true, TNullable>;
  nullable: () => NumberColumnBuilder<TOptional, true>;
  default: (value: number | null) => NumberColumnBuilder<TOptional, TNullable>;
};

function buildNumberColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<number | null, TOptional, TNullable, NumberPropertyPayload, NumberPropertyResponse>
): NumberColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildNumberColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
      }),
    nullable: () =>
      buildNumberColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
      }),
    default: (value: number | null) =>
      buildNumberColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
      }),
  };
}

export function number(name: string): NumberColumnBuilder {
  return buildNumberColumn({
    name,
    codec: numberCodec,
    isOptional: false as const,
    isNullable: false as const,
  });
}
