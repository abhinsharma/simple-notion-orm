import { dateCodec } from "@/orm/codecs";
import type { DatePropertyPayload, DatePropertyResponse } from "@/orm/codecs/primitives/date";
import type { DatePropertyInput } from "@/types/properties";
import type { ColumnDef } from "../types";

type DateValue = DatePropertyInput | null;

type DateColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  DateValue,
  TOptional,
  TNullable,
  DatePropertyPayload,
  DatePropertyResponse
> & {
  optional: () => DateColumnBuilder<true, TNullable>;
  nullable: () => DateColumnBuilder<TOptional, true>;
  default: (value: DateValue) => DateColumnBuilder<TOptional, TNullable>;
};

function buildDateColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<DateValue, TOptional, TNullable, DatePropertyPayload, DatePropertyResponse>
): DateColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildDateColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    nullable: () =>
      buildDateColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    default: (value: DateValue) =>
      buildDateColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
        propertyType: def.propertyType,
      }),
  };
}

export function date(name: string): DateColumnBuilder {
  return buildDateColumn({
    name,
    codec: dateCodec,
    isOptional: false as const,
    isNullable: false as const,
    propertyType: "date",
  });
}
