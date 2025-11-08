import { describe, it, expect } from "vitest";
import { compileQueryOptions } from "@/orm/query/compiler";
import { eq, contains, gt, and, isNull } from "@/orm/query/predicates";
import { text, number, select } from "@/orm";
import type { TableDef } from "@/orm/schema/types";

const columns = {
  title: text("Title").title(),
  points: number("Points"),
  stage: select("Stage"),
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
      where: and(
        contains(columns.title, "Hello"),
        gt(columns.points, 5),
        isNull(columns.stage)
      ),
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
    expect(() => compileQueryOptions<TestTableDef>({ where: gt(columns.title, 10) as any })).toThrow(
      /Operator 'gt' is not supported/
    );
  });
});
