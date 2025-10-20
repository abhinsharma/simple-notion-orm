import { statusCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type StatusColumnBuilder = ColumnDef & {
  optional: () => StatusColumnBuilder;
  nullable: () => StatusColumnBuilder;
  default: (value: string) => StatusColumnBuilder;
};

function buildStatusColumn(def: ColumnDef): StatusColumnBuilder {
  return Object.assign(def, {
    optional: () => buildStatusColumn({ ...def, optional: true }),
    nullable: () => buildStatusColumn({ ...def, nullable: true }),
    default: (value: string) => buildStatusColumn({ ...def, defaultValue: value }),
  });
}

export function status(name: string): StatusColumnBuilder {
  return buildStatusColumn({
    name,
    codec: statusCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as { id: string; name: string; color: string },
  });
}
