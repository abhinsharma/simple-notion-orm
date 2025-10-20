import { multiSelectCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type MultiSelectColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => MultiSelectColumnDef;
  nullable: () => MultiSelectColumnDef;
  default: (value: string[]) => MultiSelectColumnDef;
};

function buildMultiSelectColumn(def: ColumnDef): MultiSelectColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildMultiSelectColumn({ ...def, optional: true }),
    nullable: () => buildMultiSelectColumn({ ...def, nullable: true }),
    default: (value: string[]) => buildMultiSelectColumn({ ...def, defaultValue: value }),
  };
}

export function multiSelect(name: string): MultiSelectColumnDef {
  return buildMultiSelectColumn({
    name,
    codec: multiSelectCodec,
    optional: false,
    nullable: false,
  });
}
