import { buildTitleProperty } from "@/factories/properties/page";
import type { GetPageResponse, CreatePageResponse, UpdatePageResponse } from "@notionhq/client/build/src/api-endpoints";
import { describe, it, expect } from "vitest";
import { getDatabasePage, createDatabasePage, updateDatabasePage, archiveDatabasePage, restoreDatabasePage, clearDatabasePageContent } from "../database-page";
import dbPageGetFixture from "../../../tests/fixtures/db-page-get.json";

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
