import type { AnyColumnDef } from "@/orm/schema/types";
import type {
  ColumnFilterValue,
  ComparisonOperator,
  ComparisonPredicate,
  CompoundPredicate,
  NullPredicate,
  Predicate,
  SortDescriptor,
  SortDirection,
} from "./types";

export function eq<TColumn extends AnyColumnDef>(column: TColumn, value: ColumnFilterValue<TColumn>): ComparisonPredicate<TColumn> {
  return makeComparisonPredicate(column, "eq", value);
}

export function neq<TColumn extends AnyColumnDef>(column: TColumn, value: ColumnFilterValue<TColumn>): ComparisonPredicate<TColumn> {
  return makeComparisonPredicate(column, "neq", value);
}

export function contains<TColumn extends AnyColumnDef>(column: TColumn, value: ColumnFilterValue<TColumn>): ComparisonPredicate<TColumn> {
  return makeComparisonPredicate(column, "contains", value);
}

export function gt<TColumn extends AnyColumnDef>(column: TColumn, value: ColumnFilterValue<TColumn>): ComparisonPredicate<TColumn> {
  return makeComparisonPredicate(column, "gt", value);
}

export function gte<TColumn extends AnyColumnDef>(column: TColumn, value: ColumnFilterValue<TColumn>): ComparisonPredicate<TColumn> {
  return makeComparisonPredicate(column, "gte", value);
}

export function lt<TColumn extends AnyColumnDef>(column: TColumn, value: ColumnFilterValue<TColumn>): ComparisonPredicate<TColumn> {
  return makeComparisonPredicate(column, "lt", value);
}

export function lte<TColumn extends AnyColumnDef>(column: TColumn, value: ColumnFilterValue<TColumn>): ComparisonPredicate<TColumn> {
  return makeComparisonPredicate(column, "lte", value);
}

export function isNull<TColumn extends AnyColumnDef>(column: TColumn): NullPredicate<TColumn> {
  return {
    kind: "null",
    column,
    isNull: true,
  };
}

export function isNotNull<TColumn extends AnyColumnDef>(column: TColumn): NullPredicate<TColumn> {
  return {
    kind: "null",
    column,
    isNull: false,
  };
}

export function and(...predicates: Predicate[]): CompoundPredicate {
  return {
    kind: "compound",
    operator: "and",
    predicates,
  };
}

export function or(...predicates: Predicate[]): CompoundPredicate {
  return {
    kind: "compound",
    operator: "or",
    predicates,
  };
}

export function asc<TColumn extends AnyColumnDef>(column: TColumn): SortDescriptor<TColumn> {
  return makeSortDescriptor(column, "asc");
}

export function desc<TColumn extends AnyColumnDef>(column: TColumn): SortDescriptor<TColumn> {
  return makeSortDescriptor(column, "desc");
}

function makeComparisonPredicate<TColumn extends AnyColumnDef>(
  column: TColumn,
  operator: ComparisonOperator,
  value: ColumnFilterValue<TColumn>
): ComparisonPredicate<TColumn> {
  return {
    kind: "comparison",
    operator,
    column,
    value,
  };
}

function makeSortDescriptor<TColumn extends AnyColumnDef>(column: TColumn, direction: SortDirection): SortDescriptor<TColumn> {
  return {
    column,
    direction,
  };
}
