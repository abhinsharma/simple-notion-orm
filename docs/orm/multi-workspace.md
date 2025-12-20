# Multi-Workspace Support

Use multiple Notion workspaces in the same application by binding tables to specific clients.

## Creating clients

```ts
import { createNotionClient, defineTable, text } from "simple-notion-orm";

const workspace1 = createNotionClient({ auth: process.env.NOTION_KEY_WS1! });
const workspace2 = createNotionClient({ auth: process.env.NOTION_KEY_WS2! });
```

The default `NOTION_API_KEY` env-based client remains available for backward compatibility.

## Binding tables to clients

Pass `client` in the options to bind a table to a specific workspace:

```ts
const tasksWs1 = await defineTable("Tasks", { title: text("Title").title() }, { databaseId: "...", client: workspace1 });

const tasksWs2 = await defineTable("Tasks", { title: text("Title").title() }, { databaseId: "...", client: workspace2 });

// Each uses its bound client
await tasksWs1.insert({ title: "Task in workspace 1" });
await tasksWs2.insert({ title: "Task in workspace 2" });
```

## Inspecting the client

Use `getClient()` to retrieve the bound client:

```ts
const client = tasksWs1.getClient(); // returns workspace1
const defaultClient = tasks.getClient(); // returns undefined (uses env-based default)
```

## Cross-workspace relations

Relations between tables from different workspaces are not supported and will throw an error:

```ts
import { linkRelations } from "simple-notion-orm";

// This throws: "Cannot link tables from different workspaces"
await linkRelations([{ source: tasksWs1, columnKey: "project", target: projectsWs2, mode: "single" }]);
```

Ensure related tables share the same client.

## NotionPage with custom client

`NotionPage` also supports custom clients:

```ts
import { NotionPage } from "simple-notion-orm";

const page = await NotionPage.from("page-id", workspace1);
await page.updateTitle("New Title"); // Uses workspace1 client
```

## Migration from single workspace

Existing code using `NOTION_API_KEY` env continues to work unchanged. The client param is optional and defaults to the env-based singleton.
