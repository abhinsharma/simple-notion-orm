import type { NotionCodec } from "@/orm/codecs/base/codec";
import type { TablePredicate, SortDescriptor } from "@/orm/query/types";
import type { PageObjectResponse, QueryDataSourceParameters } from "@notionhq/client/build/src/api-endpoints";

export type ColumnPropertyType =
  | "title"
  | "rich_text"
  | "number"
  | "checkbox"
  | "date"
  | "email"
  | "url"
  | "phone_number"
  | "people"
  | "files"
  | "select"
  | "multi_select"
  | "status"
  | "relation"
  | "unique_id";

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
  propertyType: ColumnPropertyType;
};

export type AnyColumnDef = ColumnDef<any, boolean, boolean, any, any>;

export type ColumnValue<TColumn> = TColumn extends ColumnDef<
  infer TValue,
  infer _Optional,
  infer _Nullable,
  infer _Payload,
  infer _Response
>
  ? TValue
  : never;

export type ColumnOptional<TColumn> = TColumn extends ColumnDef<
  unknown,
  infer TOptional,
  infer _Nullable,
  unknown,
  unknown
>
  ? TOptional
  : never;

export type ColumnNullable<TColumn> = TColumn extends ColumnDef<
  unknown,
  infer _Optional,
  infer TNullable,
  unknown,
  unknown
>
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

export type RowEnvelope<TDef extends TableDef> = {
  data: RowOutput<TDef>;
  page: PageObjectResponse;
};

export type SelectOptions<TDef extends TableDef = TableDef> = {
  where?: TablePredicate<TDef>;
  orderBy?:
    | SortDescriptor<TDef["columns"][keyof TDef["columns"]]>
    | Array<SortDescriptor<TDef["columns"][keyof TDef["columns"]]>>;
  rawFilter?: QueryDataSourceParameters["filter"];
  rawSorts?: QueryDataSourceParameters["sorts"];
  pageSize?: number;
  startCursor?: string;
};

export type SelectResult<TDef extends TableDef> = {
  rows: Array<RowEnvelope<TDef>>;
  nextCursor: string | null;
  hasMore: boolean;
};

export type TargetOptions<TDef extends TableDef = TableDef> = {
  pageIds?: string[];
} & SelectOptions<TDef>;

export type UpdateOptions<TDef extends TableDef = TableDef> = TargetOptions<TDef> & {
  many?: boolean;
};

export type TableHandle<TDef extends TableDef> = {
  title: string;
  columns: TDef["columns"];
  getIds: () => { databaseId?: string; dataSourceId?: string };
  cacheIds: (ids: { databaseId?: string; dataSourceId?: string }) => void;
  insert: {
    (data: RowInput<TDef>): Promise<RowEnvelope<TDef>>;
    (data: Array<RowInput<TDef>>): Promise<Array<RowEnvelope<TDef>>>;
  };
  select: (options?: SelectOptions<TDef>) => Promise<SelectResult<TDef>>;
  update: {
    (patch: RowPatch<TDef>, options?: UpdateOptions<TDef> & { many?: false }): Promise<RowEnvelope<TDef>>;
    (patch: RowPatch<TDef>, options: UpdateOptions<TDef> & { many: true }): Promise<Array<RowEnvelope<TDef>>>;
    (patch: RowPatch<TDef>, options?: UpdateOptions<TDef>): Promise<RowEnvelope<TDef> | Array<RowEnvelope<TDef>>>;
  };
  archive: (options?: TargetOptions<TDef>) => Promise<number>;
  restore: (options?: TargetOptions<TDef>) => Promise<number>;
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

export type RowPatch<TDef extends TableDef> = Partial<RowInput<TDef>>;
