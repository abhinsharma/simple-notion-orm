import { dateCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type DateColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => DateColumnDef;
  nullable: () => DateColumnDef;
  default: (value: Date) => DateColumnDef;
};

function buildDateColumn(def: ColumnDef): DateColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildDateColumn({ ...def, optional: true }),
    nullable: () => buildDateColumn({ ...def, nullable: true }),
    default: (value: Date) => buildDateColumn({ ...def, defaultValue: value }),
  };
}

export function date(name: string): DateColumnDef {
  return buildDateColumn({
    name,
    codec: dateCodec,
    optional: false,
    nullable: false,
  });
}
