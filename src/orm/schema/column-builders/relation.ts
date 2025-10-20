import { relationCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type RelationColumnBuilder = ColumnDef & {
  optional: () => RelationColumnBuilder;
  nullable: () => RelationColumnBuilder;
  default: (value: string[]) => RelationColumnBuilder;
};

function buildRelationColumn(def: ColumnDef): RelationColumnBuilder {
  return Object.assign(def, {
    optional: () => buildRelationColumn({ ...def, optional: true }),
    nullable: () => buildRelationColumn({ ...def, nullable: true }),
    default: (value: string[]) => buildRelationColumn({ ...def, defaultValue: value }),
  });
}

export function relation(name: string): RelationColumnBuilder {
  return buildRelationColumn({
    name,
    codec: relationCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as Array<{ id: string }>,
  });
}
