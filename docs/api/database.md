# Database API Examples

| API                | Returns                    | Description                                                   |
| ------------------ | -------------------------- | ------------------------------------------------------------- |
| `getDatabase`      | `{ database, dataSource}`  | Retrieve a database and its primary data source metadata.     |
| `createDatabase`   | `{ database, dataSource}`  | Create a database under a parent page.                        |
| `updateDatabase`   | `{ database, dataSource}`  | Update database metadata or schema properties.                |
| `queryDatabase`    | `QueryDataSourceResponse`  | Query rows (pages) inside the database.                       |
| `searchDatabases`  | `SearchResponse`           | Search workspace data sources using the Notion search API.    |
| `archiveDatabase`  | `DatabaseObjectResponse`   | Move a database to the trash.                                 |
| `restoreDatabase`  | `DatabaseObjectResponse`   | Restore a database from the trash.                            |
| `getDataSource`    | `DataSourceObjectResponse` | Retrieve one data source and its schema.                      |
| `createDataSource` | `DataSourceObjectResponse` | Add a data source to an existing database.                    |
| `updateDataSource` | `DataSourceObjectResponse` | Update one data source's title, icon, schema, or trash state. |
| `queryDataSource`  | `QueryDataSourceResponse`  | Query rows in one data source.                                |

Since API version 2025-09-03, a database is a container for one or more data sources. `getDatabase`, `updateDatabase`, and `queryDatabase` act on the first data source. Use the data source helpers when a database has more than one.

## Get a database

```ts
import { getDatabase } from "simple-notion-orm";

const resource = await getDatabase("notion-database-id");
```

## Create a database

```ts
import { createDatabase, textToRichText } from "simple-notion-orm";

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
import { updateDatabase, textToRichText } from "simple-notion-orm";

const resource = await updateDatabase({
  databaseId: "notion-database-id",
  description: textToRichText("Updated description"),
});
```

## Query a database

```ts
import { queryDatabase } from "simple-notion-orm";

const results = await queryDatabase("notion-database-id");
```

## Search databases

```ts
import { searchDatabases } from "simple-notion-orm";

const results = await searchDatabases("Playground");
```

## Work with data sources

```ts
import { createDataSource, getDataSource, queryDataSource, updateDataSource, textToRichText } from "simple-notion-orm";

const second = await createDataSource({
  databaseId: "notion-database-id",
  title: textToRichText("Archive"),
  properties: { Name: { title: {} } },
});

const schema = await getDataSource(second.id);
const rows = await queryDataSource(second.id, { page_size: 10 });
await updateDataSource({ dataSourceId: second.id, inTrash: true });
```

## Trash and restore a database

```ts
import { archiveDatabase, restoreDatabase } from "simple-notion-orm";

await archiveDatabase("notion-database-id");
await restoreDatabase("notion-database-id");
```
