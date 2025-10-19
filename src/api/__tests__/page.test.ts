import { describe, it, expect } from "vitest";
import { getPage, createPage, updatePage, archivePage, restorePage, searchPages } from "../page";
import { buildTitleProperty } from "@/factories/properties/page";
import pageGetFixture from "../../../tests/fixtures/page-get.json";
import pageCreateFixture from "../../../tests/fixtures/page-create.json";
import pageUpdateFixture from "../../../tests/fixtures/page-update.json";
import pageArchiveFixture from "../../../tests/fixtures/page-archive.json";
import pageRestoreFixture from "../../../tests/fixtures/page-restore.json";
import pageSearchFixture from "../../../tests/fixtures/page-search.json";

describe("getPage", () => {
  it("should successfully retrieve a page by ID", async () => {
    const pageId = "obf_id_46";

    const result = await getPage(pageId);

    expect(result).toEqual(pageGetFixture);
    expect(result.id).toBe(pageGetFixture.id);
    expect(result.object).toBe("page");
    expect(result.properties.title.title[0].text.content).toBe("Playground");
  });
});

describe("createPage", () => {
  it("should successfully create a page", async () => {
    const result = await createPage({
      parentId: "obf_id_46",
      properties: {
        title: buildTitleProperty("Playground example 2025-10-19T22:52:39.286Z"),
      },
    });

    expect(result).toEqual(pageCreateFixture);
    expect(result.id).toBe(pageCreateFixture.id);
    expect(result.object).toBe("page");
    expect(result.properties.title.title[0].text.content).toBe("Playground example 2025-10-19T22:52:39.286Z");
  });
});

describe("updatePage", () => {
  it("should successfully update a page", async () => {
    const pageId = "obf_id_74";

    const result = await updatePage({
      pageId,
      properties: {
        title: buildTitleProperty("Updated playground 2025-10-19T22:52:39.621Z"),
      },
    });

    expect(result).toEqual(pageUpdateFixture);
    expect(result.id).toBe(pageUpdateFixture.id);
    expect(result.object).toBe("page");
    expect(result.properties.title.title[0].text.content).toBe("Updated playground 2025-10-19T22:52:39.621Z");
  });
});

describe("archivePage", () => {
  it("should successfully archive a page", async () => {
    const pageId = "obf_id_74";

    const result = await archivePage(pageId);

    expect(result).toEqual(pageArchiveFixture);
    expect(result.id).toBe(pageArchiveFixture.id);
    expect(result.archived).toBe(true);
    expect(result.in_trash).toBe(true);
  });
});

describe("restorePage", () => {
  it("should successfully restore a page", async () => {
    const pageId = "obf_id_74";

    const result = await restorePage(pageId);

    expect(result).toEqual(pageRestoreFixture);
    expect(result.id).toBe(pageRestoreFixture.id);
    expect(result.archived).toBe(false);
    expect(result.in_trash).toBe(false);
  });
});

describe("searchPages", () => {
  it("should successfully search for pages", async () => {
    const query = "Playground";

    const result = await searchPages(query);

    expect(result).toEqual(pageSearchFixture);
    expect(result.object).toBe("list");
    expect(result.results).toHaveLength(2);
    expect(result.results[0].object).toBe("page");
  });
});
