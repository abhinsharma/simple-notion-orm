import { statusCodec } from "@/orm/codecs";
import type { StatusPropertyPayload, StatusPropertyResponse } from "@/orm/codecs/options/status";
import type { SelectOptionInput } from "@/types/properties";
import type { ColumnDef } from "../types";

type StatusValue = SelectOptionInput | null;

type StatusColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  StatusValue,
  TOptional,
  TNullable,
  StatusPropertyPayload,
  StatusPropertyResponse
> & {
  optional: () => StatusColumnBuilder<true, TNullable>;
  nullable: () => StatusColumnBuilder<TOptional, true>;
  default: (value: StatusValue) => StatusColumnBuilder<TOptional, TNullable>;
};

function buildStatusColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<StatusValue, TOptional, TNullable, StatusPropertyPayload, StatusPropertyResponse>
): StatusColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildStatusColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    nullable: () =>
      buildStatusColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    default: (value: StatusValue) =>
      buildStatusColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
        propertyType: def.propertyType,
      }),
  };
}

export function status(name: string): StatusColumnBuilder {
  return buildStatusColumn({
    name,
    codec: statusCodec,
    isOptional: false as const,
    isNullable: false as const,
    propertyType: "status",
  });
}
