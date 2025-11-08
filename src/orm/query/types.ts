import type { ColumnPropertyType, TableDef, AnyColumnDef } from "@/orm/schema/types";
import type { QueryDataSourceParameters } from "@notionhq/client/build/src/api-endpoints";

export type ColumnToken<TColumn extends AnyColumnDef = AnyColumnDef> = TColumn;

export type ComparisonOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains";

export type CompoundOperator = "and" | "or";

export type ColumnFilterValue<TColumn extends AnyColumnDef> = FilterValueForProperty<TColumn["propertyType"]>;

type FilterValueForProperty<T extends ColumnPropertyType> = T extends "number"
  ? number
  : T extends "checkbox"
    ? boolean
    : T extends "date"
      ? string
      : T extends "select" | "status"
        ? string | { name: string }
        : T extends "multi_select"
          ? string
          : string;

export type ComparisonPredicate<TColumn extends AnyColumnDef = AnyColumnDef> = {
  kind: "comparison";
  operator: ComparisonOperator;
  column: TColumn;
  value: ColumnFilterValue<TColumn>;
};

export type NullPredicate<TColumn extends AnyColumnDef = AnyColumnDef> = {
  kind: "null";
  column: TColumn;
  isNull: boolean;
};

export type CompoundPredicate = {
  kind: "compound";
  operator: CompoundOperator;
  predicates: Predicate[];
};

export type Predicate<TColumn extends AnyColumnDef = AnyColumnDef> = ComparisonPredicate<TColumn> | NullPredicate<TColumn> | CompoundPredicate;

export type TablePredicate<TDef extends TableDef> = Predicate<TDef["columns"][keyof TDef["columns"]]>;

export type SortDirection = "asc" | "desc";

export type SortDescriptor<TColumn extends AnyColumnDef = AnyColumnDef> = {
  column: TColumn;
  direction: SortDirection;
};

export type QueryOverrides = {
  rawFilter?: QueryDataSourceParameters["filter"];
  rawSorts?: QueryDataSourceParameters["sorts"];
};
