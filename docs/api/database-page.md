# Database Page API Examples

| API                        | Returns              | Description                            |
| -------------------------- | -------------------- | -------------------------------------- |
| `getDatabasePage`          | `PageObjectResponse` | Retrieve a page inside a database.     |
| `createDatabasePage`       | `PageObjectResponse` | Create a new row in a data source.     |
| `updateDatabasePage`       | `PageObjectResponse` | Update row properties.                 |
| `archiveDatabasePage`      | `PageObjectResponse` | Move a row to the trash.               |
| `restoreDatabasePage`      | `PageObjectResponse` | Restore a row from the trash.          |
| `clearDatabasePageContent` | `void`               | Remove all blocks from a database row. |

All helpers live under `@/api/database-page`.

## Get a database page

```ts
import { getDatabasePage } from "simple-notion-orm";

const page = await getDatabasePage("notion-page-id");
```

## Create a database page

```ts
import { createDatabasePage, buildTitleProperty, buildParagraphBlock, textToRichText } from "simple-notion-orm";

const page = await createDatabasePage({
  dataSourceId: "notion-data-source-id",
  properties: {
    Name: buildTitleProperty("Example row"),
    Stage: {
      select: {
        name: "Todo",
      },
    },
  },
  children: [buildParagraphBlock(textToRichText("Row body"))],
});
```

- Pass `dataSourceId` to create the row in a specific data source. `databaseId` still works for databases with a single data source.

## Update a database page

```ts
import { updateDatabasePage } from "simple-notion-orm";

const page = await updateDatabasePage({
  pageId: "notion-page-id",
  properties: {
    Stage: {
      select: {
        name: "Done",
      },
    },
  },
});
```

## Append database page content

```ts
import { updateDatabasePage, buildParagraphBlock, textToRichText } from "simple-notion-orm";

await updateDatabasePage({
  pageId: "notion-page-id",
  append: {
    children: [buildParagraphBlock(textToRichText("Row body"))],
  },
});
```

- `append` also takes `after` (a block ID) or `position` (`{ type: "start" }`, `{ type: "end" }`, or `{ type: "after_block", after_block: { id } }`).
- `updateDatabasePage` takes `inTrash` to trash or restore a row. The older `archived` option still works and sends `in_trash`.

## Archive a database page

```ts
import { archiveDatabasePage } from "simple-notion-orm";

const archived = await archiveDatabasePage("notion-page-id");
```

## Restore a database page

```ts
import { restoreDatabasePage } from "simple-notion-orm";

const restored = await restoreDatabasePage("notion-page-id");
```

## Clear database page content

```ts
import { clearDatabasePageContent } from "simple-notion-orm";

await clearDatabasePageContent("notion-page-id");
```
