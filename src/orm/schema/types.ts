import type { NotionCodec } from "@/orm/codecs/base/codec";
import type { SortDescriptor, TablePredicate } from "@/orm/query/types";
import type { NotionPage } from "@/pages";
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
  | "unique_id"
  | "created_time"
  | "last_edited_time"
  | "created_by"
  | "last_edited_by";

export type ColumnDef<TValue, TOptional extends boolean, TNullable extends boolean, TPropertyPayload = unknown, TPropertyResponse = unknown> = {
  name: string;
  codec: NotionCodec<TValue, TPropertyPayload, TPropertyResponse>;
  isOptional: TOptional;
  isNullable: TNullable;
  defaultValue?: TValue;
  propertyType: ColumnPropertyType;
  config?: (name: string) => Record<string, unknown>;
  isReadOnly?: boolean;
};

type BaseAnyColumnDef = ColumnDef<unknown, boolean, boolean, unknown, unknown>;

export type AnyColumnDef = Omit<BaseAnyColumnDef, "codec"> & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- heterogeneous column registries need a shared codec type
  codec: NotionCodec<any, any, any>;
};

export type ColumnValue<TColumn> = TColumn extends ColumnDef<infer TValue, infer _Optional, infer _Nullable, infer _Payload, infer _Response> ? TValue : never;

/** @internal */
export type ColumnOptional<TColumn> = TColumn extends ColumnDef<unknown, infer TOptional, infer _Nullable, unknown, unknown> ? TOptional : never;

/** @internal */
export type ColumnNullable<TColumn> = TColumn extends ColumnDef<unknown, infer _Optional, infer TNullable, unknown, unknown> ? TNullable : never;

/** @internal */
type Simplify<T> = { [K in keyof T]: T[K] } & {};

/** @internal */
type ColumnInputValue<TColumn> = ColumnNullable<TColumn> extends true ? ColumnValue<TColumn> : Exclude<ColumnValue<TColumn>, null>;

/** @internal */
type ColumnOutputValue<TColumn> = ColumnNullable<TColumn> extends true ? ColumnValue<TColumn> | null : Exclude<ColumnValue<TColumn>, null>;

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
  _raw: PageObjectResponse;
  notionPage: NotionPage;
};

export type RelationColumnKeys<TDef extends TableDef> = {
  [K in keyof TDef["columns"]]: TDef["columns"][K]["propertyType"] extends "relation" ? K : never;
}[keyof TDef["columns"]];

export type PopulateInstruction = true | "*" | readonly string[];

export type RelationPopulateMap<TDef extends TableDef> = Partial<Record<RelationColumnKeys<TDef>, PopulateInstruction>>;

export type RelationLinkOptions = {
  type?: "single_property" | "dual_property";
  syncedPropertyName?: string;
  syncedPropertyId?: string;
};

export type SelectOptions<TDef extends TableDef = TableDef> = {
  where?: TablePredicate<TDef>;
  orderBy?: SortDescriptor<TDef["columns"][keyof TDef["columns"]]> | Array<SortDescriptor<TDef["columns"][keyof TDef["columns"]]>>;
  rawFilter?: QueryDataSourceParameters["filter"];
  rawSorts?: QueryDataSourceParameters["sorts"];
  pageSize?: number;
  startCursor?: string;
  populate?: RelationPopulateMap<TDef>;
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
  addRelation: <TKey extends RelationColumnKeys<TDef> & string>(
    columnKey: TKey,
    target: TableHandle<TableDef>,
    options?: RelationLinkOptions
  ) => Promise<void>;
};

export type RelationMap<TDef extends TableDef> = Partial<Record<RelationColumnKeys<TDef>, TableHandle<TableDef>>>;

/** @internal */
type RowAll<TDef extends TableDef> = {
  [K in keyof TDef["columns"]]: ColumnInputValue<TDef["columns"][K]>;
};

/** @internal */
type RequiredKeys<TDef extends TableDef> = {
  [K in keyof TDef["columns"]]: ColumnOptional<TDef["columns"][K]> extends false ? K : never;
}[keyof TDef["columns"]];

/** @internal */
type OptionalKeys<TDef extends TableDef> = {
  [K in keyof TDef["columns"]]: ColumnOptional<TDef["columns"][K]> extends true ? K : never;
}[keyof TDef["columns"]];

export type RowInput<TDef extends TableDef> = Simplify<
  Partial<Pick<RowAll<TDef>, OptionalKeys<TDef>>> & Pick<RowAll<TDef>, RequiredKeys<TDef>>
>;

export type RowOutput<TDef extends TableDef> = Simplify<{
  [K in keyof TDef["columns"]]: ColumnOutputValue<TDef["columns"][K]>;
}>;

export type RowPatch<TDef extends TableDef> = Partial<RowInput<TDef>>;

export type SelectedRow<TDef extends TableDef> = RowEnvelope<TDef>;
