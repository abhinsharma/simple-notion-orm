import * as databasePageApi from "@/api/database-page";
import { populateRelations } from "@/orm/relation/populate";
import { text, relation, defineRelations } from "@/orm";
import { NotionPage } from "@/pages";
import type { AnyColumnDef, RowEnvelope, RowOutput, TableDef, TableHandle } from "@/orm/schema/types";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { describe, it, expect, vi, beforeEach } from "vitest";

function createTableHandle<TColumns extends Record<string, AnyColumnDef>>(title: string, columns: TColumns): TableHandle<TableDef<TColumns>> {
  return {
    title,
    columns,
    getIds: () => ({ databaseId: "db", dataSourceId: "ds" }),
    cacheIds: () => {},
    insert: (async () => {
      throw new Error("Not implemented in tests");
    }) as TableHandle<TableDef<TColumns>>["insert"],
    select: (async () => {
      throw new Error("Not implemented in tests");
    }) as TableHandle<TableDef<TColumns>>["select"],
    update: (async () => {
      throw new Error("Not implemented in tests");
    }) as TableHandle<TableDef<TColumns>>["update"],
    archive: async () => 0,
    restore: async () => 0,
  };
}

function createProjectPage(id: string, name: string): PageObjectResponse {
  return {
    object: "page",
    id,
    created_time: "2023-01-01T00:00:00.000Z",
    last_edited_time: "2023-01-01T00:00:00.000Z",
    created_by: { object: "user", id: "user" },
    last_edited_by: { object: "user", id: "user" },
    cover: null,
    icon: null,
    parent: { type: "workspace", workspace: true },
    is_locked: false,
    archived: false,
    in_trash: false,
    properties: {
      Title: {
        id: "Title",
        type: "title",
        title: [
          {
            type: "text",
            text: { content: name, link: null },
            annotations: {
              bold: false,
              italic: false,
              strikethrough: false,
              underline: false,
              code: false,
              color: "default",
            },
            plain_text: name,
            href: null,
          },
        ],
      },
    },
    url: `https://www.notion.so/${id}`,
    public_url: null,
  };
}

function createTaskRow<TColumns extends Record<string, AnyColumnDef>>(relationKey: string, relationIds: string[]): RowEnvelope<TableDef<TColumns>> {
  const data = {
    title: "Task",
    [relationKey]: relationIds.map((relId) => ({ id: relId })),
  } as unknown as RowOutput<TableDef<TColumns>>;

  const page = createProjectPage(`task-${relationIds.join("-")}`, `Task ${relationIds.join("-")}`);

  return {
    data,
    page,
    _raw: page,
    notionPage: NotionPage.fromPage(page),
  };
}

describe("populateRelations", () => {
  const getDatabasePageSpy = vi.spyOn(databasePageApi, "getDatabasePage");
  const projectsTable = createTableHandle("Projects", {
    title: text("Title").title(),
  });
  const tasksTable = defineRelations(
    createTableHandle("Tasks", {
      title: text("Title").title(),
      project: relation("Project"),
    }),
    { project: projectsTable }
  );
  type TasksDef = TableDef<typeof tasksTable.columns>;

  beforeEach(() => {
    getDatabasePageSpy.mockReset();
    getDatabasePageSpy.mockImplementation(async (pageId: string) => {
      return createProjectPage(pageId, pageId === "proj-1" ? "Project Alpha" : "Project Beta");
    });
  });

  it("hydrates relations with full envelopes when populate=true", async () => {
    const rows: RowEnvelope<TasksDef>[] = [createTaskRow<typeof tasksTable.columns>("project", ["proj-1"])];
    const populated = await populateRelations(tasksTable, rows, {
      project: true,
    });

    const relationValue = populated[0].data.project?.[0];
    expect(relationValue).toMatchObject({
      data: expect.objectContaining({ title: "Project Alpha" }),
      page: expect.objectContaining({ id: "proj-1" }),
    });
    expect(getDatabasePageSpy).toHaveBeenCalledTimes(1);
  });

  it("hydrates relations projecting selected fields", async () => {
    const rows: RowEnvelope<TasksDef>[] = [createTaskRow<typeof tasksTable.columns>("project", ["proj-2"])];

    const populated = await populateRelations(tasksTable, rows, {
      project: ["title"],
    });

    const relationValue = populated[0].data.project?.[0];
    expect(relationValue).toEqual({
      id: "proj-2",
      title: "Project Beta",
    });
  });

  it("deduplicates fetches for repeated relation IDs", async () => {
    const rows: RowEnvelope<TasksDef>[] = [
      createTaskRow<typeof tasksTable.columns>("project", ["proj-1"]),
      createTaskRow<typeof tasksTable.columns>("project", ["proj-1"]),
    ];

    await populateRelations(tasksTable, rows, {
      project: true,
    });

    expect(getDatabasePageSpy).toHaveBeenCalledTimes(1);
  });
});
