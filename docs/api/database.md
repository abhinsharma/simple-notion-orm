# Database API Examples

| API               | Returns                   | Description                                               |
| ----------------- | ------------------------- | --------------------------------------------------------- |
| `getDatabase`     | `{ database, dataSource}` | Retrieve a database and its primary data source metadata. |
| `createDatabase`  | `{ database, dataSource}` | Create a database under a parent page.                    |
| `updateDatabase`  | `{ database, dataSource}` | Update database metadata or schema properties.            |
| `queryDatabase`   | `QueryDataSourceResponse` | Query rows (pages) inside the database.                   |
| `searchDatabases` | `SearchResponse`          | Search workspace databases using the Notion search API.   |

## Get a database

```ts
import { getDatabase } from "@/api/database";

const resource = await getDatabase("notion-database-id");
```

## Create a database

```ts
import { createDatabase } from "@/api/database";
import { textToRichText } from "@/utils/richtext";

const resource = await createDatabase({
  parentId: "notion-page-id",
  title: textToRichText("Playground database"),
  properties: {
    Name: { title: {} },
    Stage: {
      select: {
        options: [
          { name: "Backlog", color: "default" },
          { name: "In Progress", color: "blue" },
        ],
      },
    },
  },
});
```

## Update a database

```ts
import { updateDatabase } from "@/api/database";
import { textToRichText } from "@/utils/richtext";

const resource = await updateDatabase({
  databaseId: "notion-database-id",
  description: textToRichText("Updated description"),
});
```

## Query a database

```ts
import { queryDatabase } from "@/api/database";

const results = await queryDatabase("notion-database-id");
```

## Search databases

```ts
import { searchDatabases } from "@/api/database";

const results = await searchDatabases("Playground");
```
