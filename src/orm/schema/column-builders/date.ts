import { dateCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type DateColumnBuilder = ColumnDef & {
  optional: () => DateColumnBuilder;
  nullable: () => DateColumnBuilder;
  default: (value: { start: string; end?: string }) => DateColumnBuilder;
};

function buildDateColumn(def: ColumnDef): DateColumnBuilder {
  return Object.assign(def, {
    optional: () => buildDateColumn({ ...def, optional: true }),
    nullable: () => buildDateColumn({ ...def, nullable: true }),
    default: (value: { start: string; end?: string }) => buildDateColumn({ ...def, defaultValue: value }),
  });
}

export function date(name: string): DateColumnBuilder {
  return buildDateColumn({
    name,
    codec: dateCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as { start: string; end?: string },
  });
}
