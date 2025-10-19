# Page API Examples

| API           | Returns              | Description                                        |
| ------------- | -------------------- | -------------------------------------------------- |
| `getPage`     | `PageObjectResponse` | Retrieve a page by ID.                             |
| `createPage`  | `PageObjectResponse` | Create a child page under the capture page.        |
| `updatePage`  | `PageObjectResponse` | Update page properties such as title.              |
| `archivePage` | `PageObjectResponse` | Archive (soft delete) a page.                      |
| `restorePage` | `PageObjectResponse` | Restore a previously archived page.                |
| `searchPages` | `SearchResponse`     | Query pages in the workspace using Notion search.  |
| `clearPageContent` | `void`          | Remove all child blocks (content) from a page.     |

All helpers live under `@/api/page` and operate on regular (non-database) Notion pages.

## Get a page

```ts
import { getPage } from "@/api/page";

const page = await getPage("notion-page-id");
```

## Create a child page

```ts
import { createPage } from "@/api/page";
import { buildTitleProperty } from "@/factories/properties";

const page = await createPage({
  parentId: "notion-page-id",
  properties: {
    title: buildTitleProperty("New playground page"),
  },
});
```

## Update page properties

```ts
import { updatePage } from "@/api/page";
import { buildTitleProperty } from "@/factories/properties";

const page = await updatePage({
  pageId: "notion-page-id",
  properties: {
    title: buildTitleProperty("Renamed page"),
  },
});
```

## Archive a page

```ts
import { archivePage } from "@/api/page";

const archived = await archivePage("notion-page-id");
```

## Restore a page

```ts
import { restorePage } from "@/api/page";

const restored = await restorePage("notion-page-id");
```

## Search pages

```ts
import { searchPages } from "@/api/page";

const results = await searchPages("Playground");
```

## Clear page content

```ts
import { clearPageContent } from "@/api/page";

await clearPageContent("notion-page-id");
```
