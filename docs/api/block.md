# Block API Examples

| API                   | Returns                       | Description                                         |
| --------------------- | ----------------------------- | --------------------------------------------------- |
| `getBlock`            | `GetBlockResponse`            | Retrieve a block by its ID.                         |
| `getBlockChildren`    | `ListBlockChildrenResponse`   | List children under a block or page.                |
| `appendBlockChildren` | `AppendBlockChildrenResponse` | Append child blocks beneath a target block or page. |
| `updateBlock`         | `UpdateBlockResponse`         | Update an existing block.                           |
| `deleteBlock`         | `DeleteBlockResponse`         | Soft-delete (archive) a block.                      |

All helpers live under `@/api/block`.

## Get a block

```ts
import { getBlock } from "@/api/block";

const block = await getBlock("notion-block-id");
```

## List block children

```ts
import { getBlockChildren } from "@/api/block";

const children = await getBlockChildren("notion-block-or-page-id");
```

## Append block children

```ts
import { appendBlockChildren } from "@/api/block";
import { buildParagraphBlock } from "@/factories/blocks/text";
import { textToRichText } from "@/utils/richtext";

await appendBlockChildren("notion-page-id", [buildParagraphBlock(textToRichText("Hello from the playground"))]);
```

## Update a block

```ts
import { updateBlock } from "@/api/block";
import { textToRichText } from "@/utils/richtext";

await updateBlock({
  blockId: "notion-block-id",
  paragraph: {
    rich_text: textToRichText("Updated content"),
  },
});
```

## Delete a block

```ts
import { deleteBlock } from "@/api/block";

await deleteBlock("notion-block-id");
```
