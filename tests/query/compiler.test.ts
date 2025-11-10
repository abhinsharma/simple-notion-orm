import { compileQueryOptions } from "@/orm/query/compiler";
import { eq, contains, gt, and, isNull } from "@/orm/query/predicates";
import { text, number, select, uniqueId, createdBy } from "@/orm";
import type { TableDef } from "@/orm/schema/types";
import { describe, it, expect } from "vitest";

const columns = {
  title: text("Title").title(),
  points: number("Points"),
  stage: select("Stage"),
  ticketId: uniqueId("Ticket"),
  creator: createdBy("Created by"),
};

type TestTableDef = TableDef<typeof columns>;

describe("compileQueryOptions", () => {
  it("compiles comparison predicates into Notion filters", () => {
    const compiled = compileQueryOptions<TestTableDef>({
      where: eq(columns.title, "Hello"),
    });

    expect(compiled.filter).toEqual({
      property: "Title",
      title: { equals: "Hello" },
    });
  });

  it("compiles compound predicates and sorts", () => {
    const compiled = compileQueryOptions<TestTableDef>({
      where: and(contains(columns.title, "Hello"), gt(columns.points, 5), isNull(columns.stage)),
      orderBy: { column: columns.title, direction: "desc" },
    });

    expect(compiled.filter).toEqual({
      and: [
        {
          property: "Title",
          title: { contains: "Hello" },
        },
        {
          property: "Points",
          number: { greater_than: 5 },
        },
        {
          property: "Stage",
          select: { is_empty: true },
        },
      ],
    });

    expect(compiled.sorts).toEqual([
      {
        property: "Title",
        direction: "descending",
      },
    ]);
  });

  it("throws when using unsupported operator for a column type", () => {
    expect(() => compileQueryOptions<TestTableDef>({ where: gt(columns.title, "10") })).toThrow(/Operator 'gt' is not supported/);
  });

  it("normalizes unique_id filter inputs", () => {
    const compiled = compileQueryOptions<TestTableDef>({
      where: eq(columns.ticketId, "TKT-42"),
    });

    expect(compiled.filter).toEqual({
      property: "Ticket",
      unique_id: { equals: 42 },
    });
  });

  it("supports created_by contains filters with user objects", () => {
    const compiled = compileQueryOptions<TestTableDef>({
      where: contains(columns.creator, { id: "user_123" }),
    });

    expect(compiled.filter).toEqual({
      property: "Created by",
      created_by: { contains: "user_123" },
    });
  });
});
