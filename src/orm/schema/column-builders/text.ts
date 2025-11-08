import { richTextCodec, titleCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type TextColumnBuilder<TOptional extends boolean = false, TNullable extends boolean = false> = ColumnDef<
  string,
  TOptional,
  TNullable,
  any,
  any
> & {
  optional: () => TextColumnBuilder<true, TNullable>;
  nullable: () => TextColumnBuilder<TOptional, true>;
  default: (value: string) => TextColumnBuilder<TOptional, TNullable>;
  title: () => TextColumnBuilder<TOptional, TNullable>;
};

function buildTextColumn<TOptional extends boolean, TNullable extends boolean>(
  def: ColumnDef<string, TOptional, TNullable, any, any>
): TextColumnBuilder<TOptional, TNullable> {
  return {
    ...def,
    optional: () =>
      buildTextColumn({
        name: def.name,
        codec: def.codec,
        isOptional: true as const,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    nullable: () =>
      buildTextColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: true as const,
        defaultValue: def.defaultValue,
        propertyType: def.propertyType,
      }),
    default: (value: string) =>
      buildTextColumn({
        name: def.name,
        codec: def.codec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: value,
        propertyType: def.propertyType,
      }),
    title: () =>
      buildTextColumn({
        name: def.name,
        codec: titleCodec,
        isOptional: def.isOptional,
        isNullable: def.isNullable,
        defaultValue: def.defaultValue,
        propertyType: "title",
      }),
  };
}

export function text(name: string): TextColumnBuilder {
  return buildTextColumn({
    name,
    codec: richTextCodec,
    isOptional: false as const,
    isNullable: false as const,
    propertyType: "rich_text",
  });
}
