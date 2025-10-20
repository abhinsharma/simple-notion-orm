import { numberCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type NumberColumnBuilder = ColumnDef & {
  optional: () => NumberColumnBuilder;
  nullable: () => NumberColumnBuilder;
  default: (value: number) => NumberColumnBuilder;
};

function buildNumberColumn(def: ColumnDef): NumberColumnBuilder {
  return Object.assign(def, {
    optional: () => buildNumberColumn({ ...def, optional: true }),
    nullable: () => buildNumberColumn({ ...def, nullable: true }),
    default: (value: number) => buildNumberColumn({ ...def, defaultValue: value }),
  });
}

export function number(name: string): NumberColumnBuilder {
  return buildNumberColumn({
    name,
    codec: numberCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as number,
  });
}
