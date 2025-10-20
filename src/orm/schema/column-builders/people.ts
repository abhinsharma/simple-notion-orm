import { peopleCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type PeopleColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => PeopleColumnDef;
  nullable: () => PeopleColumnDef;
  default: (value: string[]) => PeopleColumnDef;
};

function buildPeopleColumn(def: ColumnDef): PeopleColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildPeopleColumn({ ...def, optional: true }),
    nullable: () => buildPeopleColumn({ ...def, nullable: true }),
    default: (value: string[]) => buildPeopleColumn({ ...def, defaultValue: value }),
  };
}

export function people(name: string): PeopleColumnDef {
  return buildPeopleColumn({
    name,
    codec: peopleCodec,
    optional: false,
    nullable: false,
  });
}
