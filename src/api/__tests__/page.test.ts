import { buildTitleProperty } from "@/factories/properties/page";
import { describe, it, expect } from "vitest";
import { getPage, createPage, updatePage, archivePage, restorePage, searchPages } from "../page";

describe("getPage", () => {
  it("should successfully retrieve a page by ID", async () => {
    const pageId = "obf_id_46";

    const result = await getPage(pageId);

    expect(result.object).toBe("page");
    expect(result.id).toBeDefined();
    expect(result.properties.title).toBeDefined();
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

    expect(result.object).toBe("page");
    expect(result.id).toBeDefined();
    expect(result.parent.type).toBe("page_id");
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

    expect(result.object).toBe("page");
    expect(result.id).toBeDefined();
  });
});

describe("archivePage", () => {
  it("should successfully archive a page", async () => {
    const pageId = "obf_id_74";

    const result = await archivePage(pageId);

    expect(result.object).toBe("page");
    expect(result.archived).toBe(true);
    expect(result.in_trash).toBe(true);
  });
});

describe("restorePage", () => {
  it("should successfully restore a page", async () => {
    const pageId = "obf_id_74";

    const result = await restorePage(pageId);

    expect(result.object).toBe("page");
    expect(result.archived).toBe(false);
    expect(result.in_trash).toBe(false);
  });
});

describe("searchPages", () => {
  it("should successfully search for pages", async () => {
    const query = "Playground";

    const result = await searchPages(query);

    expect(result.object).toBe("list");
    expect(result.results).toBeInstanceOf(Array);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].object).toBe("page");
  });
});
