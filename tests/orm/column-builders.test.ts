import { createdBy, createdTime, lastEditedBy, lastEditedTime, multiSelect, number, select, text, uniqueId } from "@/orm/schema";
import type { RowInput, TableDef } from "@/orm/schema/types";
import { buildInsertProperties } from "@/orm/schema/utils";
import { describe, expect, it } from "vitest";

describe("select column builder", () => {
  it("injects literal options into schema config", () => {
    const builder = select("Stage").options(["Backlog", "Done"] as const);
    const config = builder.config?.("Stage");

    expect(config).toMatchObject({
      Stage: {
        select: {
          options: [{ name: "Backlog" }, { name: "Done" }],
        },
      },
    });
  });

  it("preserves config through chained modifiers", () => {
    const builder = select("Stage")
      .options(["Backlog"] as const)
      .optional()
      .nullable();
    const config = builder.config?.("Stage");

    expect(config).toMatchObject({
      Stage: {
        select: {
          options: [{ name: "Backlog" }],
        },
      },
    });
  });
});

describe("multi-select column builder", () => {
  it("injects literal options into schema config", () => {
    const builder = multiSelect("Tags").options([{ name: "Docs" }, { name: "ORM" }] as const);
    const config = builder.config?.("Tags");

    expect(config).toMatchObject({
      Tags: {
        multi_select: {
          options: [{ name: "Docs" }, { name: "ORM" }],
        },
      },
    });
  });
});

describe("uniqueId column builder", () => {
  it("configures schema with prefix when provided", () => {
    const builder = uniqueId("Ticket", { prefix: "TKT" });
    const config = builder.config?.("Ticket");

    expect(config).toEqual({
      Ticket: {
        type: "unique_id",
        unique_id: {
          prefix: "TKT",
        },
      },
    });
  });
});

describe("system metadata column builders", () => {
  it("mark system columns as read-only and optional", () => {
    const createdAt = createdTime("Created time");
    const updatedAt = lastEditedTime("Last edited time");
    const createdByColumn = createdBy("Created by");
    const updatedByColumn = lastEditedBy("Last edited by");

    expect(createdAt.isReadOnly).toBe(true);
    expect(updatedAt.isReadOnly).toBe(true);
    expect(createdByColumn.isReadOnly).toBe(true);
    expect(updatedByColumn.isReadOnly).toBe(true);

    expect(createdAt.isOptional).toBe(true);
    expect(updatedAt.isOptional).toBe(true);
    expect(createdByColumn.isOptional).toBe(true);
    expect(updatedByColumn.isOptional).toBe(true);
  });
});

describe("default modifier", () => {
  it("lets inserts omit columns that have a default", () => {
    const columns = {
      title: text("Name").title(),
      effort: number("Effort").default(1),
      stage: select("Stage").default({ name: "Backlog" }),
    };

    // RowInput is the insert type. Before, .default() kept the column required here.
    const input: RowInput<TableDef<typeof columns>> = { title: "Defaults" };
    const properties = buildInsertProperties(columns, input);

    expect(properties).toMatchObject({
      Effort: { number: 1 },
      Stage: { select: { name: "Backlog" } },
    });
  });
});
