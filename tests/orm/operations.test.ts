import { defineTable, select, text, eq, asc } from "@/orm";
import { http, HttpResponse, type JsonBodyType } from "msw";
import { describe, it, expect, vi } from "vitest";
import { server } from "../setup-msw";
import dbPageCreateFixture from "../fixtures/db-page-create.json";
import dbPageUpdateFixture from "../fixtures/db-page-update.json";
import pageArchiveFixture from "../fixtures/page-archive.json";
import pageRestoreFixture from "../fixtures/page-restore.json";

const respond = <BodyType extends JsonBodyType>(data: BodyType) => HttpResponse.json<BodyType>(data);
const DATABASE_ID = "obf_id_1";

async function createTestTable() {
  return defineTable(
    "MSW Test Table",
    {
      name: text("Name").title(),
      stage: select("Stage").optional(),
    },
    { databaseId: DATABASE_ID }
  );
}

describe("ORM operations", () => {
  it("returns envelopes when inserting rows", async () => {
    const table = await createTestTable();

    const envelope = await table.insert({
      name: "Example row",
      stage: { name: "Todo" },
    });

    expect(envelope.page.id).toBe(dbPageCreateFixture.id);
    expect(envelope.data).toEqual({
      name: "Example row",
      stage: {
        id: "obf_id_65",
        name: "Todo",
        color: "default",
      },
    });
  });

  it("selects rows with decoded data, filters, and sorts", async () => {
    const table = await createTestTable();

    server.use(
      http.post("https://api.notion.com/v1/data_sources/:dataSourceId/query", async ({ request }) => {
        const body = (await request.json()) as { filter?: unknown; sorts?: unknown };
        expect(body.filter).toEqual({
          property: "Name",
          title: { equals: "Example row" },
        });
        expect(body.sorts).toEqual([
          {
            property: "Name",
            direction: "ascending",
          },
        ]);

        return respond({
          object: "list",
          results: [dbPageCreateFixture],
          next_cursor: "cursor_123",
          has_more: true,
          type: "page_or_database",
          page_or_database: {},
          request_id: "req_test",
        });
      })
    );

    const selection = await table.select({
      where: eq(table.columns.name, "Example row"),
      orderBy: asc(table.columns.name),
      pageSize: 5,
    });

    expect(selection.rows).toHaveLength(1);
    expect(selection.rows[0]?.page.id).toBe(dbPageCreateFixture.id);
    expect(selection.rows[0]?.data.name).toBe("Example row");
    expect(selection.nextCursor).toBe("cursor_123");
    expect(selection.hasMore).toBe(true);
  });

  it("updates rows and returns fresh envelopes", async () => {
    const table = await createTestTable();

    const patchSpy = vi.fn();
    server.use(
      http.patch("https://api.notion.com/v1/pages/:pageId", async ({ request }) => {
        const body = (await request.json()) as {
          properties?: Record<string, unknown>;
        };
        patchSpy(body);
        return respond(dbPageUpdateFixture);
      })
    );

    const envelope = await table.update({ stage: { name: "Done" } }, { pageIds: [dbPageCreateFixture.id] });

    expect(patchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        properties: {
          Stage: expect.objectContaining({
            select: { name: "Done" },
          }),
        },
      })
    );
    expect(envelope.data.stage).toEqual({
      id: "obf_id_66",
      name: "Done",
      color: "green",
    });
  });

  it("archives all provided page IDs", async () => {
    const table = await createTestTable();
    const archiveSpy = vi.fn();

    server.use(
      http.patch("https://api.notion.com/v1/pages/:pageId", async ({ request, params }) => {
        const body = (await request.json()) as { archived?: boolean };
        archiveSpy({ id: params.pageId, archived: body.archived });

        return respond(pageArchiveFixture);
      })
    );

    const count = await table.archive({ pageIds: ["page-1", "page-2"] });

    expect(count).toBe(2);
    expect(archiveSpy).toHaveBeenCalledTimes(2);
    expect(archiveSpy).toHaveBeenCalledWith({ id: "page-1", archived: true });
    expect(archiveSpy).toHaveBeenCalledWith({ id: "page-2", archived: true });
  });

  it("restores all provided page IDs", async () => {
    const table = await createTestTable();
    const restoreSpy = vi.fn();

    server.use(
      http.patch("https://api.notion.com/v1/pages/:pageId", async ({ request, params }) => {
        const body = (await request.json()) as { archived?: boolean };
        restoreSpy({ id: params.pageId, archived: body.archived });

        return respond(pageRestoreFixture);
      })
    );

    const count = await table.restore({ pageIds: ["page-3"] });

    expect(count).toBe(1);
    expect(restoreSpy).toHaveBeenCalledWith({ id: "page-3", archived: false });
  });
});
