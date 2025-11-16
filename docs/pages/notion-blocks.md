# Notion Blocks Helper

`src/pages/notion-blocks.ts` exposes a read-focused companion to `NotionPage`. Use it when you want to query a page's block tree (raw or simplified) without re-implementing pagination, recursion, or synced-block traversal.

| API / Property             | Returns                       | Description                                                                                              |
| -------------------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `NotionBlocks.forPage(id)` | `NotionBlocks`                | Creates a helper scoped to a page ID (used internally by `NotionPage.from`).                             |
| `listRaw(options?)`        | `Promise<PageBlock[]>`        | Lists the first-level children via `blocks.children.list`.                                               |
| `getContentRaw(options?)`  | `Promise<PageBlock[]>`        | Traverses the page tree (including synced block targets) and returns nested raw blocks.                  |
| `streamRaw(options?)`      | `AsyncGenerator<PageBlock>`   | Streams raw blocks page-by-page so consumers can process large pages without loading everything at once. |
| `list(options?)`           | `Promise<SimpleBlock[]>`      | Same as `listRaw`, but each block is reduced to the simplified JSON described below.                     |
| `getContent(options?)`     | `Promise<SimpleBlock[]>`      | Runs the tree traversal and returns the full simplified block tree.                                      |
| `stream(options?)`         | `AsyncGenerator<SimpleBlock>` | Streams simplified blocks (top-level first, then descendants) to avoid intermediate arrays.              |

> **Raw vs simplified blocks**
>
> - `PageBlock` mirrors Notion's SDK types with an added `children?: PageBlock[]` field.
> - `SimpleBlock` is a discriminated union (paragraphs, headings, media, layout, advanced, etc.) where defaults (`color: "default"`, `has_children: false`, etc.) are stripped and rich text is normalized into `{ plainText, href?, annotations? }` spans. See `src/transform/blocks/types.ts` for the full surface.

## Usage Examples

```ts
import { NotionPage } from "@/pages";

const page = await NotionPage.from(process.env.PLAYGROUND_PAGE_ID!);

// 1. Flat list of top-level children (simplified)
const topLevel = await page.blocks.list();

// 2. Full tree with nested children (simplified)
const tree = await page.blocks.getContent({ recursive: true });

// 3. Raw stream for custom processing
for await (const raw of page.blocks.streamRaw({ recursive: true })) {
  console.log(raw.type, raw.id);
}
```

## Options

`list`, `getContent`, and `stream` accept an optional object:

```ts
{
  pageSize?: number;   // forwarded to blocks.children.list
  startCursor?: string; // only for list/listRaw when you want a specific page
  recursive?: boolean; // for getContent and stream (defaults to true)
}
```

- Passing `recursive: false` to `getContent` behaves like `list`: it returns only the first-level children, but still uses the simplified `SimpleBlock` shape.
- `startCursor` is ignored by `getContent` because the method has to traverse the full tree to hydrate nested children.

## Relationship to `NotionPage`

`NotionPage` composes a `NotionBlocks` internally. Prefer `NotionPage.from(pageId)` when you need both metadata (title/icon/cover helpers) _and_ block traversal in the same flow. When you only care about blocks, call `NotionBlocks.forPage(pageId)` directly.

- `NotionPage#getBlocks({ recursive: true })` simply delegates to `notionPage.blocks.getContentRaw(...)` for backwards compatibility.
- `notionPage.blocks.getContent()` is the canonical way to obtain the simplified tree described in this file. It is the same API showcased in `playground.ts`.
