import { textToRichText } from "@/utils/richtext";
import { describe, it, expect } from "vitest";
import { getDatabase, createDatabase, updateDatabase, queryDatabase, searchDatabases } from "../database";

describe("getDatabase", () => {
  it("should successfully retrieve a database by ID", async () => {
    const databaseId = "obf_id_1";

    const result = await getDatabase(databaseId);

    expect(result.database).toBeDefined();
    expect(result.dataSource).toBeDefined();
    expect(result.database.object).toBe("database");
    expect(result.dataSource.object).toBe("data_source");
    expect(result.database.id).toBeDefined();
    expect(result.dataSource.id).toBeDefined();
  });
});

describe("createDatabase", () => {
  it("should successfully create a database", async () => {
    const result = await createDatabase({
      parentId: "obf_id_2",
      title: textToRichText("Playground Database 2025-10-19T23:03:47.384Z"),
      properties: {
        Name: {
          type: "title",
          title: {},
        },
      },
    });

    expect(result.database).toBeDefined();
    expect(result.dataSource).toBeDefined();
    expect(result.database.object).toBe("database");
    expect(result.dataSource.object).toBe("data_source");
    expect(result.database.id).toBeDefined();
    expect(result.database.parent.type).toBe("page_id");
  });
});

describe("updateDatabase", () => {
  it("should successfully update a database", async () => {
    const databaseId = "obf_id_1";

    const result = await updateDatabase({
      databaseId,
      title: textToRichText("Updated Database Title"),
    });

    expect(result.database).toBeDefined();
    expect(result.dataSource).toBeDefined();
    expect(result.database.object).toBe("database");
    expect(result.dataSource.object).toBe("data_source");
    expect(result.database.id).toBeDefined();
  });
});

describe("queryDatabase", () => {
  it("should successfully query database items", async () => {
    const databaseId = "obf_id_1";

    const result = await queryDatabase(databaseId);

    expect(result.object).toBe("list");
    expect(result.results).toBeInstanceOf(Array);
    expect(result.has_more).toBeDefined();
  });
});

describe("searchDatabases", () => {
  it("should successfully search for databases", async () => {
    const query = "Playground";

    const result = await searchDatabases(query);

    expect(result.object).toBe("list");
    expect(result.results).toBeInstanceOf(Array);
    expect(result.type).toBe("page_or_data_source");
  });
});
