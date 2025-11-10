import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { AnyColumnDef, RowInput, RowOutput, RowPatch, TableDef } from "./types";

function cloneDefaultValue<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => cloneDefaultValue(item)) as T;
  }

  const cloned: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    cloned[key] = cloneDefaultValue(nested);
  }
  return cloned as T;
}

function assertKnownColumns(columns: Record<string, AnyColumnDef>, data: Record<string, unknown>): void {
  for (const key of Object.keys(data)) {
    if (!Object.prototype.hasOwnProperty.call(columns, key)) {
      throw new Error(`Unknown column: ${key}`);
    }
  }
}

export function buildInsertProperties<TDef extends TableDef>(columns: TDef["columns"], data: RowInput<TDef>): Record<string, unknown> {
  const record = data as Record<string, unknown>;
  const properties: Record<string, unknown> = {};

  assertKnownColumns(columns, record);

  for (const [key, columnDef] of Object.entries(columns)) {
    const hasValue = Object.prototype.hasOwnProperty.call(record, key);
    let value = hasValue ? record[key] : undefined;

    if (columnDef.isReadOnly && hasValue && value !== undefined) {
      throw new Error(`Column '${key}' is read-only (${columnDef.propertyType}) and cannot be set.`);
    }

    if (!hasValue || value === undefined) {
      if (columnDef.defaultValue !== undefined) {
        value = cloneDefaultValue(columnDef.defaultValue);
      } else if (columnDef.isOptional) {
        continue;
      } else {
        throw new Error(`Missing required column: ${key}`);
      }
    }

    if (value === null && !columnDef.isNullable) {
      throw new Error(`Column '${key}' does not allow null values`);
    }

    properties[columnDef.name] = columnDef.codec.parse(value as never);
  }

  return properties;
}

export function buildUpdateProperties<TDef extends TableDef>(columns: TDef["columns"], patch: RowPatch<TDef>): Record<string, unknown> {
  const record = patch as Record<string, unknown>;
  const properties: Record<string, unknown> = {};

  assertKnownColumns(columns, record);

  for (const [key, value] of Object.entries(record)) {
    const columnDef = columns[key];
    if (!columnDef) {
      continue;
    }

    if (value === undefined) {
      continue;
    }

    if (columnDef.isReadOnly) {
      throw new Error(`Column '${key}' is read-only (${columnDef.propertyType}) and cannot be set.`);
    }

    if (value === null && !columnDef.isNullable) {
      throw new Error(`Column '${key}' does not allow null values`);
    }

    properties[columnDef.name] = columnDef.codec.parse(value as never);
  }

  if (!Object.keys(properties).length) {
    throw new Error("Update payload must include at least one column");
  }

  return properties;
}

export function decodeRow<TDef extends TableDef>(columns: TDef["columns"], page: PageObjectResponse): RowOutput<TDef> {
  const row: Record<string, unknown> = {};

  for (const [key, columnDef] of Object.entries(columns)) {
    const propertyValue = page.properties[columnDef.name];
    if (propertyValue !== undefined) {
      row[key] = columnDef.codec.encode(propertyValue as never);
    } else if (columnDef.defaultValue !== undefined) {
      row[key] = cloneDefaultValue(columnDef.defaultValue);
    } else if (columnDef.isNullable) {
      row[key] = null;
    } else {
      row[key] = undefined;
    }
  }

  return row as RowOutput<TDef>;
}
