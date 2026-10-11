# Block API Examples

| API                   | Returns                       | Description                                         |
| --------------------- | ----------------------------- | --------------------------------------------------- |
| `getBlock`            | `GetBlockResponse`            | Retrieve a block by its ID.                         |
| `getBlockChildren`    | `ListBlockChildrenResponse`   | List children under a block or page.                |
| `appendBlockChildren` | `AppendBlockChildrenResponse` | Append child blocks beneath a target block or page. |
| `updateBlock`         | `UpdateBlockResponse`         | Update an existing block.                           |
| `deleteBlock`         | `DeleteBlockResponse`         | Soft-delete (archive) a block.                      |

Import these helpers from `simple-notion-orm`.

## Get a block

```ts
import { getBlock } from "simple-notion-orm";

const block = await getBlock("notion-block-id");
```

## List block children

```ts
import { getBlockChildren } from "simple-notion-orm";

const children = await getBlockChildren("notion-block-or-page-id");
```

## Append block children

```ts
import { appendBlockChildren, buildParagraphBlock, textToRichText } from "simple-notion-orm";

await appendBlockChildren("notion-page-id", [buildParagraphBlock(textToRichText("Hello from the playground"))]);

// Insert at the start, or after a specific block
await appendBlockChildren("notion-page-id", [buildParagraphBlock(textToRichText("First"))], { position: { type: "start" } });
await appendBlockChildren("notion-page-id", [buildParagraphBlock(textToRichText("Second"))], { after: "existing-block-id" });
```

- API version 2026-03-11 replaced the `after` body parameter with `position`. The `after` option here still works and is sent as `position: { type: "after_block" }`.

## Update a block

```ts
import { updateBlock, textToRichText } from "simple-notion-orm";

await updateBlock({
  blockId: "notion-block-id",
  paragraph: {
    rich_text: textToRichText("Updated content"),
  },
});
```

## Delete a block

```ts
import { deleteBlock } from "simple-notion-orm";

await deleteBlock("notion-block-id");
```
