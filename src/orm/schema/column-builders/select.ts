import { selectCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type SelectColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => SelectColumnDef;
  nullable: () => SelectColumnDef;
  default: (value: string) => SelectColumnDef;
};

function buildSelectColumn(def: ColumnDef): SelectColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildSelectColumn({ ...def, optional: true }),
    nullable: () => buildSelectColumn({ ...def, nullable: true }),
    default: (value: string) => buildSelectColumn({ ...def, defaultValue: value }),
  };
}

export function select(name: string): SelectColumnDef {
  return buildSelectColumn({
    name,
    codec: selectCodec,
    optional: false,
    nullable: false,
  });
}
