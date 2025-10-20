import { selectCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type SelectColumnBuilder = ColumnDef & {
  optional: () => SelectColumnBuilder;
  nullable: () => SelectColumnBuilder;
  default: (value: string) => SelectColumnBuilder;
};

function buildSelectColumn(def: ColumnDef): SelectColumnBuilder {
  return Object.assign(def, {
    optional: () => buildSelectColumn({ ...def, optional: true }),
    nullable: () => buildSelectColumn({ ...def, nullable: true }),
    default: (value: string) => buildSelectColumn({ ...def, defaultValue: value }),
  });
}

export function select(name: string): SelectColumnBuilder {
  return buildSelectColumn({
    name,
    codec: selectCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as { id: string; name: string; color: string },
  });
}
