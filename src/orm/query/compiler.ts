import type { TableDef, AnyColumnDef } from "@/orm/schema/types";
import type { QueryDataSourceParameters } from "@notionhq/client/build/src/api-endpoints";
import type { Predicate, ComparisonPredicate, NullPredicate, CompoundPredicate, SortDescriptor, TablePredicate } from "./types";

type NotionFilter = QueryDataSourceParameters["filter"];
type NotionSort = NonNullable<QueryDataSourceParameters["sorts"]>[number];

const PROPERTY_FILTER_KEYS: Record<string, string | undefined> = {
  title: "title",
  rich_text: "rich_text",
  number: "number",
  checkbox: "checkbox",
  date: "date",
  created_time: "created_time",
  last_edited_time: "last_edited_time",
  email: "email",
  url: "url",
  phone_number: "phone_number",
  people: "people",
  created_by: "created_by",
  last_edited_by: "last_edited_by",
  files: "files",
  select: "select",
  multi_select: "multi_select",
  status: "status",
  relation: "relation",
  unique_id: "unique_id",
};

const OPERATOR_SUPPORT: Record<string, Array<string>> = {
  eq: ["title", "rich_text", "number", "checkbox", "date", "select", "status", "url", "email", "phone_number", "created_time", "last_edited_time", "unique_id"],
  neq: [
    "title",
    "rich_text",
    "number",
    "checkbox",
    "date",
    "select",
    "status",
    "url",
    "email",
    "phone_number",
    "created_time",
    "last_edited_time",
    "unique_id",
  ],
  contains: ["title", "rich_text", "multi_select", "people", "created_by", "last_edited_by"],
  gt: ["number", "date", "created_time", "last_edited_time", "unique_id"],
  gte: ["number", "date", "created_time", "last_edited_time", "unique_id"],
  lt: ["number", "date", "created_time", "last_edited_time", "unique_id"],
  lte: ["number", "date", "created_time", "last_edited_time", "unique_id"],
};

export type CompileOptions<TDef extends TableDef> = {
  where?: TablePredicate<TDef>;
  orderBy?: SortDescriptor<TDef["columns"][keyof TDef["columns"]]> | Array<SortDescriptor<TDef["columns"][keyof TDef["columns"]]>>;
  rawFilter?: QueryDataSourceParameters["filter"];
  rawSorts?: QueryDataSourceParameters["sorts"];
};

export function compileQueryOptions<TDef extends TableDef>(options?: CompileOptions<TDef>): Pick<QueryDataSourceParameters, "filter" | "sorts"> {
  if (!options) {
    return {};
  }

  const filter = options.rawFilter ?? (options.where ? compilePredicate(options.where) : undefined);
  const sorts = options.rawSorts ?? compileSorts<TDef>(options.orderBy);

  return {
    ...(filter ? { filter } : {}),
    ...(sorts ? { sorts } : {}),
  };
}

function compilePredicate(predicate: Predicate): NotionFilter {
  switch (predicate.kind) {
    case "comparison":
      return compileComparison(predicate);
    case "null":
      return compileNull(predicate);
    case "compound":
      return compileCompound(predicate);
    default:
      throw new Error(`Unsupported predicate kind: ${(predicate as Predicate).kind}`);
  }
}

function compileComparison(predicate: ComparisonPredicate): NotionFilter {
  validateOperatorSupport(predicate);

  const propertyTypeKey = getFilterKey(predicate.column);
  const propertyFilter = buildComparisonFilter(propertyTypeKey, predicate);

  return {
    property: predicate.column.name,
    [propertyTypeKey]: propertyFilter,
  } as NotionFilter;
}

function compileNull(predicate: NullPredicate): NotionFilter {
  const propertyTypeKey = getFilterKey(predicate.column);
  return {
    property: predicate.column.name,
    [propertyTypeKey]: predicate.isNull ? { is_empty: true } : { is_not_empty: true },
  } as NotionFilter;
}

function compileCompound(predicate: CompoundPredicate): NotionFilter {
  if (!predicate.predicates.length) {
    throw new Error("Compound predicates must include at least one child predicate.");
  }

  return {
    [predicate.operator]: predicate.predicates.map((child) => compilePredicate(child)),
  } as NotionFilter;
}

function compileSorts<TDef extends TableDef>(
  descriptors?: SortDescriptor<TDef["columns"][keyof TDef["columns"]]> | Array<SortDescriptor<TDef["columns"][keyof TDef["columns"]]>>
): QueryDataSourceParameters["sorts"] {
  if (!descriptors) {
    return undefined;
  }

  const list = Array.isArray(descriptors) ? descriptors : [descriptors];

  if (!list.length) {
    return undefined;
  }

  return list.map<NotionSort>((descriptor) => ({
    property: descriptor.column.name,
    direction: descriptor.direction === "desc" ? "descending" : "ascending",
  }));
}

function buildComparisonFilter(propertyTypeKey: string, predicate: ComparisonPredicate): Record<string, unknown> {
  const { operator, value, column } = predicate;

  switch (operator) {
    case "eq":
      return { equals: normalizeValue(column, value) };
    case "neq":
      return { does_not_equal: normalizeValue(column, value) };
    case "contains":
      return { contains: normalizeContainsValue(column, value) };
    case "gt":
      return propertyTypeKey === "date" ? { after: expectStringValue(column, value) } : { greater_than: expectNumberValue(column, value) };
    case "gte":
      return propertyTypeKey === "date" ? { on_or_after: expectStringValue(column, value) } : { greater_than_or_equal_to: expectNumberValue(column, value) };
    case "lt":
      return propertyTypeKey === "date" ? { before: expectStringValue(column, value) } : { less_than: expectNumberValue(column, value) };
    case "lte":
      return propertyTypeKey === "date" ? { on_or_before: expectStringValue(column, value) } : { less_than_or_equal_to: expectNumberValue(column, value) };
    default:
      throw new Error(`Unsupported comparison operator: ${operator}`);
  }
}

function normalizeValue(column: AnyColumnDef, value: unknown): unknown {
  switch (column.propertyType) {
    case "select":
    case "status":
      return extractOptionName(value);
    case "checkbox":
      return expectBooleanValue(column, value);
    case "number":
      return expectNumberValue(column, value);
    case "unique_id":
      return normalizeUniqueIdValue(column, value);
    case "date":
    case "created_time":
    case "last_edited_time":
      return expectStringValue(column, value);
    default:
      return expectStringValue(column, value);
  }
}

function normalizeContainsValue(column: AnyColumnDef, value: unknown): unknown {
  switch (column.propertyType) {
    case "multi_select":
      return extractOptionName(value);
    case "people":
    case "created_by":
    case "last_edited_by":
      return extractUserId(value);
    default:
      return expectStringValue(column, value);
  }
}

function extractOptionName(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "name" in value && typeof (value as { name?: unknown }).name === "string") {
    return (value as { name: string }).name;
  }
  throw new Error("Select/status filters require a string or { name } value.");
}

function expectNumberValue(column: AnyColumnDef, value: unknown): number {
  if (typeof value !== "number") {
    throw new Error(`Column '${column.name}' expects a numeric value.`);
  }
  return value;
}

const UNIQUE_ID_SUFFIX = /(\d+)$/;

function normalizeUniqueIdValue(column: AnyColumnDef, value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      breakNormalizer(column);
    }
    const match = UNIQUE_ID_SUFFIX.exec(trimmed);
    if (match) {
      return Number(match[1]);
    }
  }

  breakNormalizer(column);

  function breakNormalizer(col: AnyColumnDef): never {
    throw new Error(`unique_id filters must be a number or 'PREFIX-<number>' string for column '${col.name}'.`);
  }
}

function expectStringValue(column: AnyColumnDef, value: unknown): string {
  if (typeof value !== "string") {
    throw new Error(`Column '${column.name}' expects a string value.`);
  }
  return value;
}

function expectBooleanValue(column: AnyColumnDef, value: unknown): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Column '${column.name}' expects a boolean value.`);
  }
  return value;
}

function extractUserId(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }
  if (value && typeof value === "object" && "id" in value && typeof (value as { id?: unknown }).id === "string") {
    return (value as { id: string }).id;
  }
  throw new Error("People filters require a user id string or { id } value.");
}

function validateOperatorSupport(predicate: ComparisonPredicate): void {
  const allowedTypes = OPERATOR_SUPPORT[predicate.operator];
  if (!allowedTypes?.includes(predicate.column.propertyType)) {
    throw new Error(`Operator '${predicate.operator}' is not supported for column type '${predicate.column.propertyType}'.`);
  }
}

function getFilterKey(column: AnyColumnDef): string {
  const key = PROPERTY_FILTER_KEYS[column.propertyType];
  if (!key) {
    throw new Error(`Column '${column.name}' does not support filtering.`);
  }
  return key;
}
