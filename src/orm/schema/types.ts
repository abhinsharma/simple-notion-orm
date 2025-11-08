import type { NotionCodec } from "@/orm/codecs/base/codec";

export type ColumnDef<
  TValue,
  TOptional extends boolean,
  TNullable extends boolean,
  TPropertyPayload = unknown,
  TPropertyResponse = unknown,
> = {
  name: string;
  codec: NotionCodec<TValue, TPropertyPayload, TPropertyResponse>;
  isOptional: TOptional;
  isNullable: TNullable;
  defaultValue?: TValue;
};

export type AnyColumnDef = ColumnDef<any, boolean, boolean, any, any>;

export type ColumnValue<TColumn> = TColumn extends ColumnDef<infer TValue, any, any, any, any>
  ? TValue
  : never;

export type ColumnOptional<TColumn> = TColumn extends ColumnDef<any, infer TOptional, any, any, any>
  ? TOptional
  : never;

export type ColumnNullable<TColumn> = TColumn extends ColumnDef<any, any, infer TNullable, any, any>
  ? TNullable
  : never;

type ColumnInputValue<TColumn> = ColumnNullable<TColumn> extends true
  ? ColumnValue<TColumn>
  : Exclude<ColumnValue<TColumn>, null>;

type ColumnOutputValue<TColumn> = ColumnNullable<TColumn> extends true
  ? ColumnValue<TColumn> | null
  : Exclude<ColumnValue<TColumn>, null>;

export type TableDef<TColumns extends Record<string, AnyColumnDef> = Record<string, AnyColumnDef>> = {
  title: string;
  columns: TColumns;
  ids?: {
    databaseId?: string;
    dataSourceId?: string;
  };
};

export type TableHandle<TDef extends TableDef> = {
  title: string;
  columns: TDef["columns"];
  getIds: () => { databaseId?: string; dataSourceId?: string };
  cacheIds: (ids: { databaseId?: string; dataSourceId?: string }) => void;
  insert: (data: RowInput<TDef>) => Promise<RowOutput<TDef>>;
  select: () => Promise<Array<RowOutput<TDef>>>;
};

export type RowInput<TDef extends TableDef> = {
  [K in keyof TDef["columns"] as ColumnOptional<TDef["columns"][K]> extends true ? K : never]?: ColumnInputValue<
    TDef["columns"][K]
  >;
} & {
  [K in keyof TDef["columns"] as ColumnOptional<TDef["columns"][K]> extends false ? K : never]: ColumnInputValue<
    TDef["columns"][K]
  >;
};

export type RowOutput<TDef extends TableDef> = {
  [K in keyof TDef["columns"]]: ColumnOutputValue<TDef["columns"][K]>;
};
