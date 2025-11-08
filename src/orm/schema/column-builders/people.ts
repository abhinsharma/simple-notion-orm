import { peopleCodec } from "@/orm/codecs";
import type { PeoplePropertyPayload, PeoplePropertyResponse } from "@/orm/codecs/references/people";
import type { ColumnDef } from "../types";

type PersonReference = { id: string };
type PeopleValue = PersonReference[];

type PeopleColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  PeopleValue,
  TOptional,
  TNullable,
  PeoplePropertyPayload,
  PeoplePropertyResponse
> & {
  optional: () => PeopleColumnBuilder<true, TNullable>;
  nullable: () => PeopleColumnBuilder<TOptional, true>;
  default: (value: PeopleValue) => PeopleColumnBuilder<TOptional, TNullable>;
};

function buildPeopleColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<PeopleValue, TOptional, TNullable, PeoplePropertyPayload, PeoplePropertyResponse>
): PeopleColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildPeopleColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    nullable: () =>
      buildPeopleColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    default: (value: PeopleValue) =>
      buildPeopleColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
        propertyType: def.propertyType,
      }),
  };
}

export function people(name: string): PeopleColumnBuilder {
  return buildPeopleColumn({
    name,
    codec: peopleCodec,
    isOptional: false as const,
    isNullable: false as const,
    propertyType: "people",
  });
}
