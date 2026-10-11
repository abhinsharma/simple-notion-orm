import { defineTable, formula, rollup, text } from "@/orm/schema";
import { buildInsertProperties, decodeRow } from "@/orm/schema/utils";
import { compileQueryOptions } from "@/orm/query/compiler";
import { eq, isNull } from "@/orm/query/predicates";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";
import { captureNextRequest } from "../request-capture";

function pageWithProperties(properties: Record<string, unknown>): PageObjectResponse {
  return { object: "page", id: "page-1", properties } as unknown as PageObjectResponse;
}

describe("formula columns", () => {
  const columns = {
    total: formula("Total"),
    label: formula("Label"),
    done: formula("Done"),
    due: formula("Due"),
  };

  it("decodes every formula result type", () => {
    const row = decodeRow(
      columns,
      pageWithProperties({
        Total: { id: "a", type: "formula", formula: { type: "number", number: 12 } },
        Label: { id: "b", type: "formula", formula: { type: "string", string: "High" } },
        Done: { id: "c", type: "formula", formula: { type: "boolean", boolean: true } },
        Due: { id: "d", type: "formula", formula: { type: "date", date: { start: "2026-01-01", end: null, time_zone: null } } },
      })
    );

    expect(row).toEqual({
      total: 12,
      label: "High",
      done: true,
      due: { start: "2026-01-01", end: undefined, time_zone: undefined },
    });
  });

  it("is read-only", () => {
    expect(() => buildInsertProperties(columns, { total: 3 })).toThrow(/read-only/);
  });

  it("does not compile filters, so callers use rawFilter", () => {
    expect(() => compileQueryOptions({ where: eq(columns.total, "1") })).toThrow(/not supported for column type 'formula'/);
    expect(() => compileQueryOptions({ where: isNull(columns.total) })).toThrow(/does not support filtering/);
  });

  it("sends the expression when defineTable creates a database", async () => {
    const captured = captureNextRequest((request) => request.method === "POST" && request.url.endsWith("/v1/databases"));

    await defineTable("Invoices", { name: text("Name").title(), total: formula("Total", { expression: 'prop("Price") * 2' }) }, { parentId: "obf_parent" });

    const { body } = await captured;
    expect((body as { initial_data_source: { properties: Record<string, unknown> } }).initial_data_source.properties.Total).toEqual({
      type: "formula",
      formula: { expression: 'prop("Price") * 2' },
    });
  });

  it("throws a clear error when creating a database without an expression", async () => {
    await expect(defineTable("Invoices", { name: text("Name").title(), total: formula("Total") }, { parentId: "obf_parent" })).rejects.toThrow(
      /needs an expression/
    );
  });
});

describe("rollup columns", () => {
  const columns = {
    hours: rollup("Hours"),
    owners: rollup("Owners"),
  };

  it("decodes number and array rollups", () => {
    const owner = { type: "people", people: [{ object: "user", id: "user-1" }] };
    const row = decodeRow(
      columns,
      pageWithProperties({
        Hours: { id: "a", type: "rollup", rollup: { type: "number", function: "sum", number: 42 } },
        Owners: { id: "b", type: "rollup", rollup: { type: "array", function: "show_original", array: [owner] } },
      })
    );

    expect(row.hours).toEqual({ type: "number", function: "sum", number: 42 });
    expect(row.owners).toEqual({ type: "array", function: "show_original", array: [owner] });
  });

  it("is read-only", () => {
    expect(() => buildInsertProperties(columns, { hours: { type: "number", function: "sum", number: 1 } })).toThrow(/read-only/);
  });

  it("cannot be created by defineTable", async () => {
    await expect(defineTable("Projects", { name: text("Name").title(), hours: rollup("Hours") }, { parentId: "obf_parent" })).rejects.toThrow(
      /can only read existing databases/
    );
  });
});
