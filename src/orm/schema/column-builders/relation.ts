import { relationCodec } from "@/orm/codecs";
import type { RelationPropertyPayload, RelationPropertyResponse } from "@/orm/codecs/references/relation";
import type { ColumnDef } from "../types";

type RelationReference = { id: string };
type RelationValue = RelationReference[];

type RelationColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  RelationValue,
  TOptional,
  TNullable,
  RelationPropertyPayload,
  RelationPropertyResponse
> & {
  optional: () => RelationColumnBuilder<true, TNullable>;
  nullable: () => RelationColumnBuilder<TOptional, true>;
  default: (value: RelationValue) => RelationColumnBuilder<TOptional, TNullable>;
};

function buildRelationColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<
    RelationValue,
    TOptional,
    TNullable,
    RelationPropertyPayload,
    RelationPropertyResponse
  >
): RelationColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildRelationColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    nullable: () =>
      buildRelationColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    default: (value: RelationValue) =>
      buildRelationColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
        propertyType: def.propertyType,
      }),
  };
}

export function relation(name: string): RelationColumnBuilder {
  return buildRelationColumn({
    name,
    codec: relationCodec,
    isOptional: false as const,
    isNullable: false as const,
    propertyType: "relation",
  });
}
