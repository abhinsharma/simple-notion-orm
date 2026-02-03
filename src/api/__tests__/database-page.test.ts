import { buildParagraphBlock } from "@/factories/blocks";
import { buildTitleProperty } from "@/factories/properties/page";
import { textToRichText } from "@/utils/richtext";
import type { AppendBlockChildrenParameters, CreatePageResponse, GetPageResponse, UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import { describe, it, expect } from "vitest";
import { server } from "../../../tests/setup-msw";
import { getDatabasePage, createDatabasePage, updateDatabasePage, archiveDatabasePage, restoreDatabasePage, clearDatabasePageContent } from "../database-page";
import dbPageGetFixture from "../../../tests/fixtures/db-page-get.json";

type RecordedRequest = {
  url: string;
  method: string;
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
        .then((body) => ({ url: request.url, method: request.method, body }))
    );
  };

  server.events.on("request:start", listener);

  return async () => {
    server.events.removeListener("request:start", listener);
    return Promise.all(captured);
  };
}

describe("getDatabasePage", () => {
  it("should successfully retrieve a database page by ID", async () => {
    const pageId = dbPageGetFixture.id;

    const result = await getDatabasePage(pageId);

    expect(result.object).toBe("page");
    expect((result as GetPageResponse & { parent: { type: string } }).parent.type).toBe("data_source_id");
    expect(result.id).toBeDefined();
  });
});

describe("createDatabasePage", () => {
  it("should successfully create a database page", async () => {
    const result = await createDatabasePage({
      databaseId: "obf_id_2",
      properties: {
        Name: buildTitleProperty("New Database Page"),
      },
    });

    expect(result.object).toBe("page");
    expect((result as CreatePageResponse & { parent: { type: string } }).parent.type).toBe("data_source_id");
    expect(result.id).toBeDefined();
  });
});

describe("updateDatabasePage", () => {
  it("should successfully update a database page", async () => {
    const pageId = "obf_id_1";

    const result = await updateDatabasePage({
      pageId,
      properties: {
        Name: buildTitleProperty("Updated Database Page"),
      },
    });

    expect(result.object).toBe("page");
    expect(result.id).toBeDefined();
  });

  it("should append content when requested", async () => {
    const pageId = dbPageGetFixture.id;
    const children: AppendBlockChildrenParameters["children"] = [buildParagraphBlock(textToRichText("Append row content"))];
    const stopRecording = recordRequests((request) => request.url.includes("/v1/blocks/") || request.url.includes("/v1/pages/"));

    const result = await updateDatabasePage({
      pageId,
      append: {
        children,
      },
    });

    const requests = await stopRecording();
    const appendRequest = requests.find((request) => request.url.includes("/v1/blocks/") && request.url.includes("/children"));
    const fetchRequest = requests.find((request) => request.method === "GET" && request.url.includes(`/v1/pages/${pageId}`));

    expect(result.object).toBe("page");
    expect(appendRequest).toBeDefined();
    expect(fetchRequest).toBeDefined();
    expect(appendRequest!.method).toBe("PATCH");
    expect(new URL(appendRequest!.url).pathname).toBe(`/v1/blocks/${pageId}/children`);
  });

  it("should append content and update properties together", async () => {
    const pageId = dbPageGetFixture.id;
    const children: AppendBlockChildrenParameters["children"] = [buildParagraphBlock(textToRichText("Append and update"))];
    const stopRecording = recordRequests((request) => request.url.includes("/v1/blocks/") || request.url.includes("/v1/pages/"));

    const result = await updateDatabasePage({
      pageId,
      properties: {
        Name: buildTitleProperty("Updated Database Page"),
      },
      append: {
        children,
      },
    });

    const requests = await stopRecording();
    const appendRequest = requests.find((request) => request.url.includes("/v1/blocks/") && request.url.includes("/children"));
    const updateRequest = requests.find((request) => request.method === "PATCH" && request.url.includes(`/v1/pages/${pageId}`));

    expect(result.object).toBe("page");
    expect(appendRequest).toBeDefined();
    expect(updateRequest).toBeDefined();
    expect(appendRequest!.method).toBe("PATCH");
    expect(new URL(appendRequest!.url).pathname).toBe(`/v1/blocks/${pageId}/children`);
  });
});

describe("archiveDatabasePage", () => {
  it("should successfully archive a database page", async () => {
    const pageId = "obf_id_1";

    const result = await archiveDatabasePage(pageId);

    expect(result.object).toBe("page");
    expect((result as UpdatePageResponse & { archived: boolean; in_trash: boolean }).archived).toBe(true);
    expect((result as UpdatePageResponse & { archived: boolean; in_trash: boolean }).in_trash).toBe(true);
  });
});

describe("restoreDatabasePage", () => {
  it("should successfully restore a database page", async () => {
    const pageId = "obf_id_1";

    const result = await restoreDatabasePage(pageId);

    expect(result.object).toBe("page");
    expect((result as UpdatePageResponse & { archived: boolean; in_trash: boolean }).archived).toBe(false);
    expect((result as UpdatePageResponse & { archived: boolean; in_trash: boolean }).in_trash).toBe(false);
  });
});

describe("clearDatabasePageContent", () => {
  it("should successfully clear all content from a database page", async () => {
    const pageId = "obf_id_1";

    await expect(clearDatabasePageContent(pageId)).resolves.toBeUndefined();
  });
});
