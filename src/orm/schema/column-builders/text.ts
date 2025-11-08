import {
  richTextCodec,
  titleCodec,
  type RichTextPropertyPayload,
  type RichTextPropertyResponse,
  type TitlePropertyPayload,
  type TitlePropertyResponse,
} from "@/orm/codecs";
import type { ColumnDef } from "../types";

type TextColumnBuilder<
  TOptional extends boolean = false,
  TNullable extends boolean = false,
  TPayload = RichTextPropertyPayload,
  TResponse = RichTextPropertyResponse
> = ColumnDef<string, TOptional, TNullable, TPayload, TResponse> & {
  optional: () => TextColumnBuilder<true, TNullable, TPayload, TResponse>;
  nullable: () => TextColumnBuilder<TOptional, true, TPayload, TResponse>;
  default: (value: string) => TextColumnBuilder<TOptional, TNullable, TPayload, TResponse>;
  title: () => TextColumnBuilder<TOptional, TNullable, TitlePropertyPayload, TitlePropertyResponse>;
};

function buildTextColumn<
  TOptional extends boolean,
  TNullable extends boolean,
  TPayload,
  TResponse
>(def: ColumnDef<string, TOptional, TNullable, TPayload, TResponse>): TextColumnBuilder<TOptional, TNullable, TPayload, TResponse> {
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
      buildTextColumn<TOptional, TNullable, TitlePropertyPayload, TitlePropertyResponse>({
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
