import type { NotionCodec } from "@/orm/codecs/base/codec";

export type ColumnDef = {
  name: string;
  codec: NotionCodec;
  optional: boolean;
  nullable: boolean;
  defaultValue?: unknown;
  __type?: unknown;
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
  insert: (data: RowInput<TDef>) => Promise<RowOutput<TDef>>;
  select: () => Promise<Array<RowOutput<TDef>>>;
};

export type RowInput<TDef extends TableDef> = {
  [K in keyof TDef["columns"] as TDef["columns"][K]["optional"] extends true ? K : never]?: TDef["columns"][K]["__type"];
} & {
  [K in keyof TDef["columns"] as TDef["columns"][K]["optional"] extends false ? K : never]: TDef["columns"][K]["__type"];
};

export type RowOutput<TDef extends TableDef> = {
  [K in keyof TDef["columns"]]: TDef["columns"][K]["nullable"] extends true
    ? TDef["columns"][K]["__type"] | null
    : TDef["columns"][K]["__type"];
};
