import { richTextCodec, titleCodec } from "@/orm/codecs";
import type { ColumnDef } from "../types";

type TextColumnDef = Omit<ColumnDef, "optional" | "nullable"> & {
  optional: () => TextColumnDef;
  nullable: () => TextColumnDef;
  default: (value: string) => TextColumnDef;
  title: () => TextColumnDef;
};

function buildTextColumn(def: ColumnDef): TextColumnDef {
  const { optional: _optional, nullable: _nullable, ...rest } = def;
  return {
    ...rest,
    optional: () => buildTextColumn({ ...def, optional: true }),
    nullable: () => buildTextColumn({ ...def, nullable: true }),
    default: (value: string) => buildTextColumn({ ...def, defaultValue: value }),
    title: () => buildTextColumn({ ...def, codec: titleCodec }),
  };
}

export function text(name: string): TextColumnDef {
  return buildTextColumn({
    name,
    codec: richTextCodec,
    optional: false,
    nullable: false,
  });
}
