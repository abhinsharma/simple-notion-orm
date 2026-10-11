# Page API Examples

| API                | Returns              | Description                                       |
| ------------------ | -------------------- | ------------------------------------------------- |
| `getPage`          | `PageObjectResponse` | Retrieve a page by ID.                            |
| `createPage`       | `PageObjectResponse` | Create a child page under the capture page.       |
| `updatePage`       | `PageObjectResponse` | Update page properties such as title.             |
| `archivePage`      | `PageObjectResponse` | Move a page to the trash.                         |
| `restorePage`      | `PageObjectResponse` | Restore a page from the trash.                    |
| `movePage`         | `PageObjectResponse` | Move a page under another page or data source.    |
| `searchPages`      | `SearchResponse`     | Query pages in the workspace using Notion search. |
| `clearPageContent` | `void`               | Remove all child blocks (content) from a page.    |

Import these helpers from `simple-notion-orm`. They operate on regular pages outside databases.

## Get a page

```ts
import { getPage } from "simple-notion-orm";

const page = await getPage("notion-page-id");
```

## Create a child page

```ts
import { createPage, buildTitleProperty } from "simple-notion-orm";

const page = await createPage({
  parentId: "notion-page-id",
  properties: {
    title: buildTitleProperty("New playground page"),
  },
});
```

## Update page properties

```ts
import { updatePage, buildTitleProperty } from "simple-notion-orm";

const page = await updatePage({
  pageId: "notion-page-id",
  properties: {
    title: buildTitleProperty("Renamed page"),
  },
});
```

## Append page content

```ts
import { updatePage, buildParagraphBlock, textToRichText } from "simple-notion-orm";

await updatePage({
  pageId: "notion-page-id",
  append: {
    children: [buildParagraphBlock(textToRichText("Appended content"))],
  },
});
```

- `append` also takes `after` (a block ID) or `position` (`{ type: "start" }`, `{ type: "end" }`, or `{ type: "after_block", after_block: { id } }`).
- `updatePage` takes `inTrash` to trash or restore a page. The older `archived` option still works and sends `in_trash`, which API version 2026-03-11 requires.

## Archive a page

```ts
import { archivePage } from "simple-notion-orm";

const archived = await archivePage("notion-page-id");
```

## Restore a page

```ts
import { restorePage } from "simple-notion-orm";

const restored = await restorePage("notion-page-id");
```

## Move a page

```ts
import { movePage } from "simple-notion-orm";

await movePage({ pageId: "notion-page-id", parent: { pageId: "new-parent-page-id" } });
await movePage({ pageId: "notion-page-id", parent: { dataSourceId: "notion-data-source-id" } });
```

## Search pages

```ts
import { searchPages } from "simple-notion-orm";

const results = await searchPages("Playground");
```

## Clear page content

```ts
import { clearPageContent } from "simple-notion-orm";

await clearPageContent("notion-page-id");
```
