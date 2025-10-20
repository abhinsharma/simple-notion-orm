import { numberCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type NumberColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => NumberColumnDef;
  nullable: () => NumberColumnDef;
  default: (value: number) => NumberColumnDef;
};

function buildNumberColumn(def: ColumnDef): NumberColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildNumberColumn({ ...def, optional: true }),
    nullable: () => buildNumberColumn({ ...def, nullable: true }),
    default: (value: number) => buildNumberColumn({ ...def, defaultValue: value }),
  };
}

export function number(name: string): NumberColumnDef {
  return buildNumberColumn({
    name,
    codec: numberCodec,
    optional: false,
    nullable: false,
  });
}
