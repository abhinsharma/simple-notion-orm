import type { NotionCodec } from "@/orm/codecs/base/codec";

export type ColumnDef = {
  name: string;
  codec: NotionCodec;
  optional: boolean;
  nullable: boolean;
  defaultValue?: unknown;
};

export type TableDef = {
  title: string;
  columns: Record<string, ColumnDef>;
  ids?: {
    databaseId?: string;
    dataSourceId?: string;
  };
};

export type TableHandle<TDef extends TableDef = TableDef> = {
  title: string;
  columns: TDef["columns"];
  getIds: () => { databaseId?: string; dataSourceId?: string };
  cacheIds: (ids: { databaseId?: string; dataSourceId?: string }) => void;
};

export type RowInput<TDef extends TableDef> = {
  [K in keyof TDef["columns"]as TDef["columns"][K]["optional"] extends true ? K : never]?: unknown;
} & {
  [K in keyof TDef["columns"] as TDef["columns"][K]["optional"] extends false ? K : never]: unknown;
};

export type RowOutput<TDef extends TableDef> = {
  [K in keyof TDef["columns"]]: unknown;
};
