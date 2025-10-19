# Database Page API Examples

| API                    | Returns              | Description                                        |
| ---------------------- | -------------------- | -------------------------------------------------- |
| `getDatabasePage`      | `PageObjectResponse` | Retrieve a page inside a database.                 |
| `createDatabasePage`   | `PageObjectResponse` | Create a new row inside a database.                |
| `updateDatabasePage`   | `PageObjectResponse` | Update row properties.                             |
| `archiveDatabasePage`  | `PageObjectResponse` | Archive (soft delete) a row.                       |
| `restoreDatabasePage`  | `PageObjectResponse` | Restore an archived row.                           |
| `clearDatabasePageContent` | `void`           | Remove all blocks from a database row.             |

All helpers live under `@/api/database-page`.

## Get a database page

```ts
import { getDatabasePage } from "@/api/database-page";

const page = await getDatabasePage("notion-page-id");
```

## Create a database page

```ts
import { createDatabasePage } from "@/api/database-page";
import { buildTitleProperty } from "@/factories/properties";
import { buildParagraphBlock } from "@/factories/blocks/text";
import { textToRichText } from "@/utils/richtext";

const page = await createDatabasePage({
  databaseId: "notion-database-id",
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

## Update a database page

```ts
import { updateDatabasePage } from "@/api/database-page";

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

## Archive a database page

```ts
import { archiveDatabasePage } from "@/api/database-page";

const archived = await archiveDatabasePage("notion-page-id");
```

## Restore a database page

```ts
import { restoreDatabasePage } from "@/api/database-page";

const restored = await restoreDatabasePage("notion-page-id");
```

## Clear database page content

```ts
import { clearDatabasePageContent } from "@/api/database-page";

await clearDatabasePageContent("notion-page-id");
```
