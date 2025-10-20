import { urlCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type UrlColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => UrlColumnDef;
  nullable: () => UrlColumnDef;
  default: (value: string) => UrlColumnDef;
};

function buildUrlColumn(def: ColumnDef): UrlColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildUrlColumn({ ...def, optional: true }),
    nullable: () => buildUrlColumn({ ...def, nullable: true }),
    default: (value: string) => buildUrlColumn({ ...def, defaultValue: value }),
  };
}

export function url(name: string): UrlColumnDef {
  return buildUrlColumn({
    name,
    codec: urlCodec,
    optional: false,
    nullable: false,
  });
}
