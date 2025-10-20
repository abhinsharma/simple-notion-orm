import { peopleCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type PeopleColumnBuilder = ColumnDef & {
  optional: () => PeopleColumnBuilder;
  nullable: () => PeopleColumnBuilder;
  default: (value: string[]) => PeopleColumnBuilder;
};

function buildPeopleColumn(def: ColumnDef): PeopleColumnBuilder {
  return Object.assign(def, {
    optional: () => buildPeopleColumn({ ...def, optional: true }),
    nullable: () => buildPeopleColumn({ ...def, nullable: true }),
    default: (value: string[]) => buildPeopleColumn({ ...def, defaultValue: value }),
  });
}

export function people(name: string): PeopleColumnBuilder {
  return buildPeopleColumn({
    name,
    codec: peopleCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as Array<{ id: string; name?: string }>,
  });
}
