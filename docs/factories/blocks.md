# Block Factories

Block factories live under `@/factories/blocks`. They return payloads compatible with the Notion Blocks API so you can compose complex layouts without manually shaping JSON.

| Factory | Description |
| ------- | ----------- |
| `buildParagraphBlock(richText, options?)` | Create a paragraph block. |
| `buildHeadingBlock(level, richText, options?)` | Heading level 1–3 with optional toggle state. |
| `buildBulletedListItemBlock(richText, options?)` | Bulleted list item. |
| `buildNumberedListItemBlock(richText, options?)` | Numbered list item. |
| `buildToDoBlock(richText, options?)` | Checkbox to-do block. |
| `buildToggleBlock(richText, options?)` | Toggle block. |
| `buildQuoteBlock(richText, options?)` | Quote block. |
| `buildImageBlock(source, caption?)` | Image block for external/file sources. |
| `buildVideoBlock(source, caption?)` | Video block. |
| `buildBookmarkBlock(url, caption?)` | Bookmark preview. |
| `buildEmbedBlock(url, caption?)` | Generic embed. |
| `buildPdfBlock(source, caption?)` | PDF block. |
| `buildFileBlock(source, name?, caption?)` | Generic file block. |
| `buildAudioBlock(source, caption?)` | Audio block. |
| `buildDividerBlock()` | Horizontal divider. |
| `buildBreadcrumbBlock()` | Breadcrumb block. |
| `buildTableOfContentsBlock(color?)` | Table of contents placeholder. |
| `buildTableBlock(rows, options?)` | Table wrapper. |
| `buildTableRowBlock(cells)` | Table row helper. |
| `buildColumnListBlock(columns)` | Multi-column container. |
| `buildColumnBlock(children)` | Column wrapper used with `buildColumnListBlock`. |
| `buildCodeBlock(richText, language, caption?)` | Code block with syntax highlighting. |
| `buildCalloutBlock(richText, options?)` | Callout with optional emoji/icon. |
| `buildEquationBlock(expression)` | LaTeX equation block. |
| `buildSyncedBlock(children?)` | Synced block container. |
| `buildSyncedBlockReference(blockId)` | Reference to another synced block. |
| `buildLinkToPageBlock(link)` | Link to page block. |
| `buildTemplateBlock(richText, children?)` | Template block placeholder. |

## Usage Examples

### Append a paragraph

```ts
import "dotenv/config";
import { appendBlockChildren } from "@/api/block";
import { buildParagraphBlock } from "@/factories/blocks/text";
import { textToRichText } from "@/utils/richtext";

await appendBlockChildren("notion-page-id", [
  buildParagraphBlock(textToRichText("Hello from block factories")),
]);
```

### Create columns with mixed content

```ts
import { appendBlockChildren } from "@/api/block";
import {
  buildColumnListBlock,
  buildColumnBlock,
  buildParagraphBlock,
  buildImageBlock,
} from "@/factories/blocks";
import { textToRichText } from "@/utils/richtext";

const columnList = buildColumnListBlock([
  buildColumnBlock([
    buildParagraphBlock(textToRichText("Left column text")),
  ]),
  buildColumnBlock([
    buildImageBlock({ type: "external", url: "https://picsum.photos/400/300" }),
  ]),
]);

await appendBlockChildren("notion-page-id", [columnList]);
```

The factories return plain objects; you can compose them, clone them, or store them in your own abstraction before sending them to Notion.
