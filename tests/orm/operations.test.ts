import { defineTable, select, text, eq, asc } from "@/orm";
import { describe, it, expect } from "vitest";
import { server } from "../setup-msw";
import dbPageCreateFixture from "../fixtures/db-page-create.json";

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

type RecordedRequest = {
  url: string;
  body: unknown;
};

function recordRequests(predicate: (request: Request) => boolean) {
  const captured: Array<Promise<RecordedRequest>> = [];

  const listener = ({ request }: { request: Request }) => {
    if (!predicate(request)) {
      return;
    }

    const clone = request.clone();
    captured.push(
      clone
        .json()
        .catch(() => undefined)
        .then((body) => ({ url: request.url, body }))
    );
  };

  server.events.on("request:start", listener);

  return async () => {
    server.events.removeListener("request:start", listener);
    return Promise.all(captured);
  };
}

function getPageIdFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const segments = parsed.pathname.split("/");
    return segments[segments.length - 1] ?? "";
  } catch {
    return "";
  }
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

    const stopRecording = recordRequests((request) => request.url.includes("/v1/data_sources/"));

    const selection = await table.select({
      where: eq(table.columns.name, "Example row"),
      orderBy: asc(table.columns.name),
      pageSize: 5,
    });

    const [queryRequest] = await stopRecording();
    const queryBody = queryRequest.body as { filter?: unknown; sorts?: unknown };

    expect(queryBody.filter).toEqual({
      property: "Name",
      title: { equals: "Example row" },
    });
    expect(queryBody.sorts).toEqual([
      {
        property: "Name",
        direction: "ascending",
      },
    ]);

    expect(selection.rows).toHaveLength(1);
    expect(selection.rows[0]?.page.id).toBe(dbPageCreateFixture.id);
    expect(selection.rows[0]?.data.name).toBe("Example row");
    expect(selection.nextCursor).toBe("cursor_123");
    expect(selection.hasMore).toBe(true);
  });

  it("updates rows and returns fresh envelopes", async () => {
    const table = await createTestTable();

    const stopRecording = recordRequests((request) => request.url.includes("/v1/pages/"));

    const envelope = await table.update({ stage: { name: "Done" } }, { pageIds: [dbPageCreateFixture.id] });

    const [updateRequest] = await stopRecording();
    const requestBody = updateRequest.body as { properties?: Record<string, unknown> };

    expect(requestBody).toEqual(
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

    const stopRecording = recordRequests((request) => request.url.includes("/v1/pages/"));

    const count = await table.archive({ pageIds: ["page-1", "page-2"] });

    const archiveRequests = await stopRecording();
    const payloads = archiveRequests.map((request) => ({
      id: getPageIdFromUrl(request.url),
      body: request.body as { archived?: boolean },
    }));

    expect(count).toBe(2);
    expect(payloads).toContainEqual({ id: "page-1", body: { archived: true } });
    expect(payloads).toContainEqual({ id: "page-2", body: { archived: true } });
  });

  it("restores all provided page IDs", async () => {
    const table = await createTestTable();

    const stopRecording = recordRequests((request) => request.url.includes("/v1/pages/"));

    const count = await table.restore({ pageIds: ["page-3"] });

    const [restoreRequest] = await stopRecording();
    const restorePayload = {
      id: getPageIdFromUrl(restoreRequest.url),
      body: restoreRequest.body as { archived?: boolean },
    };

    expect(count).toBe(1);
    expect(restorePayload).toEqual({ id: "page-3", body: { archived: false } });
  });
});
