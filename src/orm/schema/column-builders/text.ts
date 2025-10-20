import { richTextCodec, titleCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type TextColumnBuilder = ColumnDef & {
  optional: () => TextColumnBuilder;
  nullable: () => TextColumnBuilder;
  default: (value: string) => TextColumnBuilder;
  title: () => TextColumnBuilder;
};

function buildTextColumn(def: ColumnDef): TextColumnBuilder {
  return Object.assign(def, {
    optional: () => buildTextColumn({ ...def, optional: true }),
    nullable: () => buildTextColumn({ ...def, nullable: true }),
    default: (value: string) => buildTextColumn({ ...def, defaultValue: value }),
    title: () => buildTextColumn({ ...def, codec: titleCodec }),
  });
}

export function text(name: string): TextColumnBuilder {
  return buildTextColumn({
    name,
    codec: richTextCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as string,
  });
}
