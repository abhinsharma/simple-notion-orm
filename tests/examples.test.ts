import { describe, expect, it } from "vitest";
import { http, HttpResponse } from "msw";
import { run as runDataSources } from "../examples/data-sources";
import { run as runPageContent } from "../examples/page-content";
import { run as runTasksTable } from "../examples/tasks-table";
import { server } from "./setup-msw";

// The examples run against the MSW handlers in tests/handlers.ts. They use the same code path as a live run.
const env = { NOTION_API_KEY: "test-api-key", TASKS_DATABASE_ID: "obf_id_1", PAGE_ID: "obf_id_74" };

describe("examples", () => {
  it("tasks-table inserts, queries, pages through, updates and trashes rows", async () => {
    const result = await runTasksTable(env);

    // The mock returns one row per page and two pages, so selectAll collects two rows.
    expect(result).toMatchObject({ firstPageCount: 1, hasMore: true, allTodoCount: 2, trashed: 1 });
    expect(result.createdId).toBeTruthy();
  });

  it("page-content appends nested blocks, reads them and comments", async () => {
    const result = await runPageContent(env);

    expect(result.pageId).toBe("obf_id_74");
    expect(result.blockTypes.length).toBeGreaterThan(0);
    expect(result.commentId).toBeTruthy();
  });

  it("data-sources reads schemas and rows without requiring user-list access", async () => {
    server.use(
      http.get("https://api.notion.com/v1/users", () =>
        HttpResponse.json({ object: "error", code: "restricted_resource", message: "Personal access tokens cannot list users." }, { status: 403 })
      )
    );
    const result = await runDataSources(env);

    expect(result.dataSourceIds).toEqual(["obf_id_3"]);
    expect(result.propertyTypes).toEqual({ Stage: "select", Name: "title" });
    expect(result.rowIds).toHaveLength(1);
  });

  it("fails with a clear message when a required variable is missing", async () => {
    await expect(runTasksTable({})).rejects.toThrow("Set TASKS_DATABASE_ID before running this example.");
  });
});
