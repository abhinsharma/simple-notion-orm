import { relation, text } from "@/orm";
import type { TableDef, TableHandle } from "@/orm/schema/types";
import { linkRelations, rel } from "@/orm/relation/linker";
import { describe, expect, it, vi, beforeEach } from "vitest";

const updateDatabaseMock = vi.fn();

vi.mock("@/api/database", () => ({
  updateDatabase: (...args: unknown[]) => updateDatabaseMock(...args),
}));

function createTableHandle<TColumns extends Record<string, unknown>>(
  title: string,
  columns: TColumns,
  ids: { databaseId: string; dataSourceId: string }
): TableHandle<TableDef<TColumns>> {
  return {
    title,
    columns,
    getIds: () => ({ ...ids }),
    cacheIds: () => {},
    insert: async () => {
      throw new Error("not implemented");
    },
    select: async () => {
      throw new Error("not implemented");
    },
    update: async () => {
      throw new Error("not implemented");
    },
    archive: async () => 0,
    restore: async () => 0,
    addRelation: async () => {},
  } as TableHandle<TableDef<TColumns>>;
}

describe("linkRelations", () => {
  beforeEach(() => {
    updateDatabaseMock.mockReset();
  });

  it("patches relation properties with target data source ids", async () => {
    const projects = createTableHandle(
      "Projects",
      {
        title: text("Title").title(),
      },
      { databaseId: "proj-db", dataSourceId: "proj-ds" }
    );

    const tasks = createTableHandle(
      "Tasks",
      {
        title: text("Title").title(),
        project: relation("Project"),
      },
      { databaseId: "task-db", dataSourceId: "task-ds" }
    );

    await linkRelations([rel(tasks, "project").to(projects).single()]);

    expect(updateDatabaseMock).toHaveBeenCalledWith({
      databaseId: "task-db",
      properties: {
        Project: expect.objectContaining({
          relation: expect.objectContaining({ data_source_id: "proj-ds", type: "single_property" }),
        }),
      },
    });
  });
});
