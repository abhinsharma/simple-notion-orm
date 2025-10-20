import { checkboxCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type CheckboxColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => CheckboxColumnDef;
  default: (value: boolean) => CheckboxColumnDef;
};

function buildCheckboxColumn(def: ColumnDef): CheckboxColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildCheckboxColumn({ ...def, optional: true }),
    default: (value: boolean) => buildCheckboxColumn({ ...def, defaultValue: value }),
  };
}

export function checkbox(name: string): CheckboxColumnDef {
  return buildCheckboxColumn({
    name,
    codec: checkboxCodec,
    optional: false,
    nullable: false,
  });
}
