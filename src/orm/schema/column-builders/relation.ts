import { relationCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type RelationColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => RelationColumnDef;
  nullable: () => RelationColumnDef;
  default: (value: string[]) => RelationColumnDef;
};

function buildRelationColumn(def: ColumnDef): RelationColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildRelationColumn({ ...def, optional: true }),
    nullable: () => buildRelationColumn({ ...def, nullable: true }),
    default: (value: string[]) => buildRelationColumn({ ...def, defaultValue: value }),
  };
}

export function relation(name: string): RelationColumnDef {
  return buildRelationColumn({
    name,
    codec: relationCodec,
    optional: false,
    nullable: false,
  });
}
