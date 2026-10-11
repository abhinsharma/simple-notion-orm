import { relation, text } from "@/orm";
import type { AnyColumnDef, TableDef, TableHandle } from "@/orm/schema/types";
import { linkRelations, type RelationLinkInstruction } from "@/orm/relation/linker";
import { describe, expect, it, vi, beforeEach } from "vitest";

const updateDataSourceMock = vi.fn();

vi.mock("@/api/database", () => ({
  updateDataSource: (...args: unknown[]) => updateDataSourceMock(...args),
}));

function createTableHandle<TColumns extends Record<string, AnyColumnDef>>(
  title: string,
  columns: TColumns,
  ids: { databaseId: string; dataSourceId: string }
): TableHandle<TableDef<TColumns>> {
  return {
    title,
    columns,
    getIds: () => ({ ...ids }),
    cacheIds: () => {},
    getClient: () => undefined,
    insert: async () => {
      throw new Error("not implemented");
    },
    select: async () => {
      throw new Error("not implemented");
    },
    selectAll: async () => {
      throw new Error("not implemented");
    },
    update: async () => {
      throw new Error("not implemented");
    },
    archive: async () => 0,
    restore: async () => 0,
    addRelation: async () => {},
    addRelations: async () => {},
  } as TableHandle<TableDef<TColumns>>;
}

describe("linkRelations", () => {
  beforeEach(() => {
    updateDataSourceMock.mockReset();
  });

  it("patches relation properties with target data source ids", async () => {
    const projectColumns = {
      title: text("Title").title(),
    } satisfies Record<string, AnyColumnDef>;
    const projects = createTableHandle<typeof projectColumns>("Projects", projectColumns, { databaseId: "proj-db", dataSourceId: "proj-ds" });

    const taskColumns = {
      title: text("Title").title(),
      project: relation("Project"),
    } satisfies Record<string, AnyColumnDef>;
    const tasks = createTableHandle<typeof taskColumns>("Tasks", taskColumns, { databaseId: "task-db", dataSourceId: "task-ds" });

    const instruction: RelationLinkInstruction = {
      source: tasks as unknown as TableHandle<TableDef>,
      columnKey: "project",
      target: projects as unknown as TableHandle<TableDef>,
      mode: "single",
    };

    await linkRelations([instruction]);

    // The relation goes to the source table's own data source, not the database's first one.
    expect(updateDataSourceMock).toHaveBeenCalledWith(
      {
        dataSourceId: "task-ds",
        properties: {
          Project: expect.objectContaining({
            relation: expect.objectContaining({ data_source_id: "proj-ds", type: "single_property" }),
          }),
        },
      },
      undefined // client param
    );
  });
});
