import { urlCodec } from "@/orm/codecs";
import type { ColumnDef} from "../types";

type UrlColumnBuilder = ColumnDef & {
  optional: () => UrlColumnBuilder;
  nullable: () => UrlColumnBuilder;
  default: (value: string) => UrlColumnBuilder;
};

function buildUrlColumn(def: ColumnDef): UrlColumnBuilder {
  return Object.assign(def, {
    optional: () => buildUrlColumn({ ...def, optional: true }),
    nullable: () => buildUrlColumn({ ...def, nullable: true }),
    default: (value: string) => buildUrlColumn({ ...def, defaultValue: value }),
  });
}

export function url(name: string): UrlColumnBuilder {
  return buildUrlColumn({
    name,
    codec: urlCodec,
    optional: false,
    nullable: false,
    __type: undefined as unknown as string,
  });
}
