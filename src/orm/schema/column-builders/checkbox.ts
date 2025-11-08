import { checkboxCodec } from "@/orm/codecs";
import type { CheckboxPropertyPayload, CheckboxPropertyResponse } from "@/orm/codecs/primitives/checkbox";
import type { ColumnDef } from "../types";

type CheckboxColumnBuilder<TOptional extends boolean = false> = ColumnDef<boolean, TOptional, false, CheckboxPropertyPayload, CheckboxPropertyResponse> & {
  optional: () => CheckboxColumnBuilder<true>;
  default: (value: boolean) => CheckboxColumnBuilder<TOptional>;
};

function buildCheckboxColumn<TOptional extends boolean>(
  def: ColumnDef<boolean, TOptional, false, CheckboxPropertyPayload, CheckboxPropertyResponse>
): CheckboxColumnBuilder<TOptional> {
  return {
    ...def,
    optional: () =>
      buildCheckboxColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    default: (value: boolean) =>
      buildCheckboxColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
        propertyType: def.propertyType,
      }),
  };
}

export function checkbox(name: string): CheckboxColumnBuilder {
  return buildCheckboxColumn({
    name,
    codec: checkboxCodec,
    isOptional: false as const,
    isNullable: false as const,
    propertyType: "checkbox",
  });
}
