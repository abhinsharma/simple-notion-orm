# Notion Page Helper

`src/pages/notion-page.ts` exposes a lightweight `NotionPage` wrapper around any Notion page ID. Use it when you need to manipulate blocks, covers, or archived state without dropping down to the raw SDK.

| API / Property                             | Returns                                                    | Description                                                                                                                         |
| ------------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `NotionPage.from(pageId)`                  | `Promise<NotionPage>`                                      | Fetch a page by ID and hydrate a wrapper plus block helper in one call.                                                             |
| `NotionPage.fromPage(page)`                | `NotionPage`                                               | Wraps an existing `PageObjectResponse` (for example, from `table.select`).                                                          |
| `notionPage.id` / `notionPage.raw`         | `string` / `PageObjectResponse`                            | Peek at the page ID or the last cached metadata.                                                                                    |
| `notionPage.blocks`                        | `NotionBlocks`                                             | Read helper for raw or transformed block traversal (`list`, `getContent`, `stream`). See `docs/pages/notion-blocks.md` for details. |
| `refresh(filterProperties?)`               | `Promise<PageObjectResponse>`                              | Reload metadata from Notion, optionally limiting properties.                                                                        |
| `get(options?)`                            | `Promise<PageObjectResponse & { children?: PageBlock[] }>` | Fetch metadata and, if requested, the current block tree (with optional recursion and page size).                                   |
| `updateTitle(title)`                       | `Promise<PageObjectResponse>`                              | Locates the canonical title property and overwrites it.                                                                             |
| `setIcon(icon)` / `setCover(cover)`        | `Promise<PageObjectResponse>`                              | Forward to the Notion Pages API to update chrome.                                                                                   |
| `archive()` / `restore()`                  | `Promise<PageObjectResponse>`                              | Toggle the archived flag for the wrapped page.                                                                                      |
| `clearContent()`                           | `Promise<void>`                                            | Removes all child blocks from the page.                                                                                             |
| `append(blocks, options?)` / `add(blocks)` | `Promise<NotionPage>`                                      | Appends up to 100 blocks per request, chunking large arrays automatically (optional `after` cursor).                                |
| `insertAfter(blockId, blocks)`             | `Promise<NotionPage>`                                      | Inserts blocks after an existing block ID.                                                                                          |
| `updateBlock(blockId, patch)`              | `Promise<void>`                                            | Calls `blocks.update` with the provided payload.                                                                                    |
| `deleteBlock(blockId)`                     | `Promise<void>`                                            | Archives a block via the Blocks API.                                                                                                |
| `getBlocks({ recursive?, pageSize? })`     | `Promise<PageBlock[]>`                                     | Lists child blocks, optionally walking the entire tree (synced blocks expand via `synced_from`).                                    |

## Accessing `NotionPage` from ORM rows

`RowEnvelope` now bundles a `.notionPage` handle so you can jump straight into block operations without an extra lookup:

```ts
import { defineTable, text } from "@/orm/schema";
import { buildCalloutBlock, buildParagraphBlock } from "@/factories/blocks";
import { textToRichText } from "@/utils/richtext";

const notes = await defineTable("Docs Notes", { title: text("Title").title() }, { databaseId: process.env.NOTION_NOTES_DB! });

const { rows } = await notes.select({ pageSize: 1 });
const entry = rows[0];

await entry?.notionPage.append([
  buildParagraphBlock(textToRichText("Synced via NotionPage helper")),
  buildCalloutBlock(textToRichText("Rendered via block factories"), { icon: { type: "emoji", emoji: "🧱" } }),
]);
```

Because the handle caches the `PageObjectResponse`, subsequent calls like `setIcon` or `setCover` reuse the latest metadata where possible.

## Traversing blocks via `NotionBlocks`

`notionPage.blocks` exposes a `NotionBlocks` instance backed by the same page ID. Use it for read-heavy scenarios when you do not need to mutate metadata:

```ts
const page = await NotionPage.from(process.env.PLAYGROUND_PAGE_ID!);

// Raw Notion blocks (BlockObjectResponse[])
const raw = await page.blocks.listRaw();

// Transformed helpers (SimpleBlock[] – already stripped of raw metadata)
const blocks = await page.blocks.getContent({ recursive: true });

for await (const block of page.blocks.stream()) {
  console.log(block.type, block.id);
}
```

`listRaw`/`getContentRaw`/`streamRaw` mirror the low-level API for debugging, while `list`/`getContent`/`stream` forward blocks through the transform layer outlined in `docs/pages/notion-blocks.md`.

## Updating page chrome & state

```ts
const page = entry?.notionPage;
if (!page) return;

await page.updateTitle("Docs sync complete");
await page.setIcon({ type: "emoji", emoji: "📚" });
await page.setCover({
  type: "external",
  external: { url: "https://source.unsplash.com/random/1600x900" },
});
await page.archive();
await page.restore();
```

All chrome updates return the updated `PageObjectResponse`, so you can track the latest metadata or log activity for audits.

## Working with the block tree

```ts
const page = await NotionPage.from(process.env.PLAYGROUND_PAGE_ID!);
const tree = await page.blocks.getContent({ recursive: true });
const todos = tree.filter((block) => block.type === "to_do");

for (const todo of todos) {
  if (todo.to_do && !todo.to_do.checked) {
    await page.updateBlock(todo.id, {
      to_do: { ...todo.to_do, checked: true },
    });
  }
}
```

- `append` and `insertAfter` automatically chunk writes into batches of 100 blocks, which matches Notion’s API limit.
- `page.blocks.list()` returns the first-level children, while `page.blocks.getContent({ recursive: true })` traverses nested children and synced blocks so you don’t have to orchestrate repeated `blocks.children.list` calls manually. Use `page.blocks.stream()` for async iteration.

Use `NotionPage` whenever you need richer block/page workflows after the ORM gives you typed row data—it keeps page mutations colocated with the row lifecycle without forcing you back into the low-level SDK.
