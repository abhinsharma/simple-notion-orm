import { defineTable, relation, text } from "@/orm";
import * as linker from "@/orm/relation/linker";
import { describe, expect, it, beforeEach, vi } from "vitest";

const createDatabaseMock = vi.fn(async (payload: { title: unknown }) => {
  const suffix = typeof payload.title === "string" ? payload.title.replace(/\s+/g, "-") : "db";
  return {
    database: { id: `db-${suffix}` },
    dataSource: { id: `ds-${suffix}` },
  };
});

vi.mock("@/api/database", () => ({
  createDatabase: (...args: unknown[]) => createDatabaseMock(...(args as [Parameters<typeof createDatabaseMock>[0]])),
  getDatabase: vi.fn(),
}));

describe("TableHandle.addRelations", () => {
  beforeEach(() => {
    createDatabaseMock.mockClear();
  });

  it("batches relation instructions and forwards them to linkRelations", async () => {
    const linkRelationsSpy = vi.spyOn(linker, "linkRelations").mockResolvedValue();

    const projects = await defineTable("Projects", { title: text("Title").title() }, { parentId: "parent" });

    const documents = await defineTable("Documents", { title: text("Title").title() }, { parentId: "parent" });

    const tasks = await defineTable(
      "Tasks",
      {
        title: text("Title").title(),
        project: relation("Project"),
        documents: relation("Documents"),
      },
      { parentId: "parent" }
    );

    await tasks.addRelations({
      project: { target: projects, options: { type: "dual_property", syncedPropertyName: "Tasks" } },
      documents: { target: documents },
    });

    expect(linkRelationsSpy).toHaveBeenCalledTimes(1);
    const [instructions] = linkRelationsSpy.mock.calls[0] ?? [];
    expect(instructions).toHaveLength(2);
    expect(instructions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ columnKey: "project", mode: "dual", options: expect.objectContaining({ syncedPropertyName: "Tasks" }) }),
        expect.objectContaining({ columnKey: "documents", mode: "single" }),
      ])
    );

    linkRelationsSpy.mockRestore();
  });

  it("skips linking when all entries are undefined", async () => {
    const linkRelationsSpy = vi.spyOn(linker, "linkRelations").mockResolvedValue();

    const table = await defineTable("Minimal", { title: text("Title").title(), project: relation("Project") }, { parentId: "parent" });

    await table.addRelations({ project: undefined });

    expect(linkRelationsSpy).not.toHaveBeenCalled();
    linkRelationsSpy.mockRestore();
  });
});
