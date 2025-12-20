import { http, HttpResponse, type JsonBodyType } from "msw";
import pageGetFixture from "./fixtures/page-get.json";
import pageCreateFixture from "./fixtures/page-create.json";
import pageUpdateFixture from "./fixtures/page-update.json";
import pageArchiveFixture from "./fixtures/page-archive.json";
import pageRestoreFixture from "./fixtures/page-restore.json";
import dbPageGetFixture from "./fixtures/db-page-get.json";
import dbPageUpdateFixture from "./fixtures/db-page-update.json";
import dbPageArchiveFixture from "./fixtures/db-page-archive.json";
import dbPageRestoreFixture from "./fixtures/db-page-restore.json";
import pageSearchFixture from "./fixtures/page-search.json";
import blockGetFixture from "./fixtures/block-get.json";
import blockChildrenFixture from "./fixtures/block-children.json";
import blockAppendFixture from "./fixtures/block-append.json";
import blockUpdateFixture from "./fixtures/block-update.json";
import blockDeleteFixture from "./fixtures/block-delete.json";
import databaseGetFixture from "./fixtures/database-get.json";
import databaseCreateFixture from "./fixtures/database-create.json";
import databaseUpdateFixture from "./fixtures/database-update.json";
import databaseSearchFixture from "./fixtures/database-search.json";
import databaseQueryFixture from "./fixtures/database-query.json";
import dbPageCreateFixture from "./fixtures/db-page-create.json";
import commentListFixture from "./fixtures/comment-list.json";
import commentCreateFixture from "./fixtures/comment-create.json";
import commentGetFixture from "./fixtures/comment-get.json";

const respond = <BodyType extends JsonBodyType>(data: BodyType) => HttpResponse.json<BodyType>(data);

export const handlers = [
  http.get<never, undefined, { ok: boolean }>("https://api.notion.com/v1/ping", () => respond({ ok: true })),

  http.get<{ pageId: string }, undefined, typeof pageGetFixture | typeof dbPageGetFixture>("https://api.notion.com/v1/pages/:pageId", ({ params }) => {
    if (params.pageId === dbPageGetFixture.id) {
      return respond(dbPageGetFixture);
    }
    return respond(pageGetFixture);
  }),

  http.post<never, Record<string, unknown>, typeof dbPageCreateFixture | typeof pageCreateFixture>("https://api.notion.com/v1/pages", async ({ request }) => {
    const body = (await request.json()) as { parent?: { database_id?: string; page_id?: string } };
    if (body.parent?.database_id) {
      return respond(dbPageCreateFixture);
    }

    return respond(pageCreateFixture);
  }),

  http.patch<
    { pageId: string },
    Record<string, unknown>,
    | typeof pageUpdateFixture
    | typeof pageArchiveFixture
    | typeof pageRestoreFixture
    | typeof dbPageUpdateFixture
    | typeof dbPageArchiveFixture
    | typeof dbPageRestoreFixture
  >("https://api.notion.com/v1/pages/:pageId", async ({ request, params }) => {
    const body = (await request.json()) as { archived?: boolean };

    if (params.pageId === dbPageGetFixture.id) {
      if (body.archived === true) {
        return respond(dbPageArchiveFixture);
      }
      if (body.archived === false) {
        return respond(dbPageRestoreFixture);
      }
      return respond(dbPageUpdateFixture);
    }

    if (body.archived === true) {
      return respond(pageArchiveFixture);
    }
    if (body.archived === false) {
      return respond(pageRestoreFixture);
    }
    return respond(pageUpdateFixture);
  }),

  http.post<never, Record<string, unknown>, typeof databaseSearchFixture | typeof pageSearchFixture>(
    "https://api.notion.com/v1/search",
    async ({ request }) => {
      const body = (await request.json()) as { filter?: { value?: string } };
      if (body.filter?.value === "data_source") {
        return respond(databaseSearchFixture);
      }
      return respond(pageSearchFixture);
    }
  ),

  http.get<{ blockId: string }, undefined, typeof blockGetFixture>("https://api.notion.com/v1/blocks/:blockId", () => respond(blockGetFixture)),

  http.get<{ blockId: string }, undefined, typeof blockChildrenFixture>("https://api.notion.com/v1/blocks/:blockId/children", () =>
    respond(blockChildrenFixture)
  ),

  http.patch<{ blockId: string }, Record<string, unknown>, typeof blockAppendFixture>("https://api.notion.com/v1/blocks/:blockId/children", () =>
    respond(blockAppendFixture)
  ),

  http.patch<{ blockId: string }, Record<string, unknown>, typeof blockUpdateFixture>("https://api.notion.com/v1/blocks/:blockId", () =>
    respond(blockUpdateFixture)
  ),

  http.delete<{ blockId: string }, undefined, typeof blockDeleteFixture>("https://api.notion.com/v1/blocks/:blockId", () => respond(blockDeleteFixture)),

  http.get<{ databaseId: string }, undefined, typeof databaseGetFixture.database>("https://api.notion.com/v1/databases/:databaseId", () =>
    respond(databaseGetFixture.database)
  ),

  http.get<{ dataSourceId: string }, undefined, typeof databaseGetFixture.dataSource>("https://api.notion.com/v1/data_sources/:dataSourceId", () =>
    respond(databaseGetFixture.dataSource)
  ),

  http.post<never, Record<string, unknown>, typeof databaseCreateFixture.database>("https://api.notion.com/v1/databases", () =>
    respond(databaseCreateFixture.database)
  ),

  http.patch<{ databaseId: string }, Record<string, unknown>, typeof databaseUpdateFixture.database>("https://api.notion.com/v1/databases/:databaseId", () =>
    respond(databaseUpdateFixture.database)
  ),

  http.patch<{ dataSourceId: string }, Record<string, unknown>, typeof databaseUpdateFixture.dataSource>(
    "https://api.notion.com/v1/data_sources/:dataSourceId",
    () => respond(databaseUpdateFixture.dataSource)
  ),

  http.post<never, Record<string, unknown>, typeof databaseQueryFixture>("https://api.notion.com/v1/data_sources/:dataSourceId/query", () =>
    respond(databaseQueryFixture)
  ),

  http.get<never, undefined, typeof commentListFixture>("https://api.notion.com/v1/comments", () => respond(commentListFixture)),

  http.post<never, Record<string, unknown>, typeof commentCreateFixture>("https://api.notion.com/v1/comments", () => respond(commentCreateFixture)),

  http.get<{ commentId: string }, undefined, typeof commentGetFixture>("https://api.notion.com/v1/comments/:commentId", () => respond(commentGetFixture)),
];
