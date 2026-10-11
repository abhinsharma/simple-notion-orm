import { textToRichText } from "@/utils/richtext";
import { describe, it, expect } from "vitest";
import { captureNextRequest } from "../../../tests/request-capture";
import {
  archiveDatabase,
  createDatabase,
  createDataSource,
  getDatabase,
  getDataSource,
  queryDatabase,
  restoreDatabase,
  searchDatabases,
  updateDatabase,
  updateDataSource,
} from "../database";

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

describe("getDataSource", () => {
  it("retrieves a data source by ID", async () => {
    const result = await getDataSource("obf_id_3");

    expect(result.object).toBe("data_source");
    expect(result.properties).toBeDefined();
  });
});

describe("createDataSource", () => {
  it("adds a data source to a database", async () => {
    const captured = captureNextRequest((request) => request.method === "POST" && request.url.endsWith("/v1/data_sources"));

    const result = await createDataSource({
      databaseId: "obf_id_1",
      title: textToRichText("Second source"),
      properties: { Name: { title: {} } },
    });

    const { body } = await captured;
    expect(body).toEqual(
      expect.objectContaining({
        parent: { type: "database_id", database_id: "obf_id_1" },
        properties: { Name: { title: {} } },
      })
    );
    expect(result.object).toBe("data_source");
  });
});

describe("updateDataSource", () => {
  it("sends in_trash and returns the refreshed data source", async () => {
    const captured = captureNextRequest((request) => request.method === "PATCH" && request.url.includes("/v1/data_sources/"));

    const result = await updateDataSource({ dataSourceId: "obf_id_3", inTrash: true });

    const { body } = await captured;
    expect(body).toEqual({ in_trash: true });
    expect(result.object).toBe("data_source");
  });
});

describe("archiveDatabase and restoreDatabase", () => {
  it("sends in_trash true when archiving", async () => {
    const captured = captureNextRequest((request) => request.method === "PATCH" && request.url.includes("/v1/databases/"));

    const result = await archiveDatabase("obf_id_1");

    const { body } = await captured;
    expect(body).toEqual({ in_trash: true });
    expect(result.object).toBe("database");
  });

  it("sends in_trash false when restoring", async () => {
    const captured = captureNextRequest((request) => request.method === "PATCH" && request.url.includes("/v1/databases/"));

    await restoreDatabase("obf_id_1");

    const { body } = await captured;
    expect(body).toEqual({ in_trash: false });
  });
});
