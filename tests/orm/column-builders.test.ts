import { multiSelect, select } from "@/orm/schema";
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
    const builder = select("Stage").options(["Backlog"] as const).optional().nullable();
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
