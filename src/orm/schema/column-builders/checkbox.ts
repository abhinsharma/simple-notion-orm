import { checkboxCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type CheckboxColumnBuilder = ColumnDef & {
  optional: () => CheckboxColumnBuilder;
  default: (value: boolean) => CheckboxColumnBuilder;
};

function buildCheckboxColumn(def: ColumnDef): CheckboxColumnBuilder {
  return Object.assign(def, {
    optional: () => buildCheckboxColumn({ ...def, optional: true }),
    default: (value: boolean) => buildCheckboxColumn({ ...def, defaultValue: value }),
  });
}

export function checkbox(name: string): CheckboxColumnBuilder {
  return buildCheckboxColumn({
    name,
    codec: checkboxCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as boolean,
  });
}
