import { multiSelectCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type MultiSelectColumnBuilder = ColumnDef & {
  optional: () => MultiSelectColumnBuilder;
  nullable: () => MultiSelectColumnBuilder;
  default: (value: string[]) => MultiSelectColumnBuilder;
};

function buildMultiSelectColumn(def: ColumnDef): MultiSelectColumnBuilder {
  return Object.assign(def, {
    optional: () => buildMultiSelectColumn({ ...def, optional: true }),
    nullable: () => buildMultiSelectColumn({ ...def, nullable: true }),
    default: (value: string[]) => buildMultiSelectColumn({ ...def, defaultValue: value }),
  });
}

export function multiSelect(name: string): MultiSelectColumnBuilder {
  return buildMultiSelectColumn({
    name,
    codec: multiSelectCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as Array<{ id: string; name: string; color: string }>,
  });
}
