import { appendBlockChildren, updateBlock } from "@/api/block";
import { createNotionClient } from "@/api/client";
import { archiveDatabasePage, createDatabasePage, restoreDatabasePage } from "@/api/database-page";
import { archivePage, restorePage, updatePage } from "@/api/page";
import { buildParagraphBlock } from "@/factories/blocks";
import { textToRichText } from "@/utils/richtext";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";
import blockAppendFixture from "../../../tests/fixtures/block-append.json";
import databaseFixture from "../../../tests/fixtures/database-get.json";
import pageFixture from "../../../tests/fixtures/page-get.json";
import { server } from "../../../tests/setup-msw";

let client: ReturnType<typeof createNotionClient>;
beforeEach(() => {
  client = createNotionClient({ auth: "test-api-key" });
});
const children = [buildParagraphBlock(textToRichText("Inserted paragraph"))];

describe("Notion API 2026-03-11", () => {
  it.each([
    { options: { after: "previous-block" }, position: { type: "after_block", after_block: { id: "previous-block" } } },
    { options: { position: { type: "start" as const } }, position: { type: "start" } },
    { options: undefined, position: undefined },
  ])("serializes block placement: $position", async ({ options, position }) => {
    let body: unknown;
    let version: string | null = null;
    server.use(
      http.patch("https://api.notion.com/v1/blocks/:blockId/children", async ({ request }) => {
        body = await request.json();
        version = request.headers.get("Notion-Version");
        return HttpResponse.json(blockAppendFixture);
      })
    );

    await appendBlockChildren("page-id", children, options, client);

    expect(version).toBe("2026-03-11");
    expect(body).toEqual({ children, ...(position ? { position } : {}) });
  });

  it.each([
    { operation: archivePage, inTrash: true },
    { operation: restorePage, inTrash: false },
    { operation: archiveDatabasePage, inTrash: true },
    { operation: restoreDatabasePage, inTrash: false },
  ])("sends trash state for $operation.name", async ({ operation, inTrash }) => {
    let body: unknown;
    server.use(
      http.patch("https://api.notion.com/v1/pages/:pageId", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...pageFixture, in_trash: inTrash });
      })
    );

    const result = await operation("page-id", client);

    expect(body).toEqual({ in_trash: inTrash });
    expect("in_trash" in result && result.in_trash).toBe(inTrash);
    expect(result).not.toHaveProperty("archived");
  });

  it("preserves append-after through page updates", async () => {
    let body: unknown;
    server.use(
      http.patch("https://api.notion.com/v1/blocks/:blockId/children", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(blockAppendFixture);
      })
    );

    await updatePage({ pageId: "page-id", append: { children, after: "previous-block" } }, client);

    expect(body).toEqual({ children, position: { type: "after_block", after_block: { id: "previous-block" } } });
  });

  it.each([{ in_trash: true }, { archived: true }])("updates block trash state with %j", async (trashState) => {
    let body: unknown;
    server.use(
      http.patch("https://api.notion.com/v1/blocks/:blockId", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json({ ...blockAppendFixture.results[0], in_trash: true });
      })
    );

    await updateBlock({ blockId: "block-id", ...trashState }, client);

    expect(body).toEqual({ in_trash: true });
  });
});

describe("database page parents", () => {
  it.each([undefined, "selected-source"])("creates rows in data source %s", async (dataSourceId) => {
    let body: unknown;
    let databaseReads = 0;
    server.use(
      http.get("https://api.notion.com/v1/databases/:databaseId", () => {
        databaseReads += 1;
        return HttpResponse.json(databaseFixture.database);
      }),
      http.post("https://api.notion.com/v1/pages", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(pageFixture);
      })
    );

    await createDatabasePage({ databaseId: "database-id", dataSourceId, properties: {} }, client);

    expect(body).toEqual({ parent: { data_source_id: dataSourceId ?? databaseFixture.dataSource.id }, properties: {} });
    expect(databaseReads).toBe(dataSourceId ? 0 : 1);
  });
});
