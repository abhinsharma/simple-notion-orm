import { statusCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type StatusColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => StatusColumnDef;
  nullable: () => StatusColumnDef;
  default: (value: string) => StatusColumnDef;
};

function buildStatusColumn(def: ColumnDef): StatusColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildStatusColumn({ ...def, optional: true }),
    nullable: () => buildStatusColumn({ ...def, nullable: true }),
    default: (value: string) => buildStatusColumn({ ...def, defaultValue: value }),
  };
}

export function status(name: string): StatusColumnDef {
  return buildStatusColumn({
    name,
    codec: statusCodec,
    optional: false,
    nullable: false,
  });
}
