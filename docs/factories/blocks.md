# Block Factories

Import block factories from `simple-notion-orm`. They return payloads compatible with the Notion Blocks API so you can compose complex layouts without manually shaping JSON.

| Factory                                          | Description                                      |
| ------------------------------------------------ | ------------------------------------------------ |
| `buildParagraphBlock(richText, options?)`        | Create a paragraph block.                        |
| `buildHeadingBlock(level, richText, options?)`   | Heading level 1–4 with optional toggle state.    |
| `buildBulletedListItemBlock(richText, options?)` | Bulleted list item.                              |
| `buildNumberedListItemBlock(richText, options?)` | Numbered list item.                              |
| `buildToDoBlock(richText, options?)`             | Checkbox to-do block.                            |
| `buildToggleBlock(richText, options?)`           | Toggle block.                                    |
| `buildQuoteBlock(richText, options?)`            | Quote block.                                     |
| `buildImageBlock(source, caption?)`              | Image block from an external URL or file upload. |
| `buildVideoBlock(source, caption?)`              | Video block.                                     |
| `buildBookmarkBlock(url, caption?)`              | Bookmark preview.                                |
| `buildEmbedBlock(url, caption?)`                 | Generic embed.                                   |
| `buildPdfBlock(source, caption?)`                | PDF block.                                       |
| `buildFileBlock(source, name?, caption?)`        | Generic file block.                              |
| `buildAudioBlock(source, caption?)`              | Audio block.                                     |
| `buildDividerBlock()`                            | Horizontal divider.                              |
| `buildBreadcrumbBlock()`                         | Breadcrumb block.                                |
| `buildTableOfContentsBlock(color?)`              | Table of contents placeholder.                   |
| `buildTableBlock(rows, options?)`                | Table wrapper.                                   |
| `buildTableRowBlock(cells)`                      | Table row helper.                                |
| `buildColumnListBlock(columns)`                  | Multi-column container.                          |
| `buildColumnBlock(children)`                     | Column wrapper used with `buildColumnListBlock`. |
| `buildCodeBlock(richText, language, caption?)`   | Code block with syntax highlighting.             |
| `buildCalloutBlock(richText, options?)`          | Callout with optional emoji/icon.                |
| `buildEquationBlock(expression)`                 | LaTeX equation block.                            |
| `buildSyncedBlock(children?)`                    | Synced block container.                          |
| `buildSyncedBlockReference(blockId)`             | Reference to another synced block.               |
| `buildLinkToPageBlock(link)`                     | Link to page block.                              |
| `buildTemplateBlock(richText, children?)`        | Template block placeholder.                      |

## Usage Examples

### Append a paragraph

```ts
import "dotenv/config";
import { appendBlockChildren, buildParagraphBlock, textToRichText } from "simple-notion-orm";

await appendBlockChildren("notion-page-id", [buildParagraphBlock(textToRichText("Hello from block factories"))]);
```

### Create columns with mixed content

```ts
import { appendBlockChildren, buildColumnListBlock, buildColumnBlock, buildParagraphBlock, buildImageBlock, textToRichText } from "simple-notion-orm";

const columnList = buildColumnListBlock([
  buildColumnBlock([buildParagraphBlock(textToRichText("Left column text"))]),
  buildColumnBlock([buildImageBlock({ type: "external", url: "https://picsum.photos/400/300" })]),
]);

await appendBlockChildren("notion-page-id", [columnList]);
```

### Nest blocks without casts

```ts
import { appendBlockChildren, buildHeadingBlock, buildParagraphBlock, buildToggleBlock, textToRichText } from "simple-notion-orm";

await appendBlockChildren("notion-page-id", [
  buildToggleBlock(textToRichText("Details"), {
    children: [buildHeadingBlock(4, textToRichText("Notes")), buildParagraphBlock(textToRichText("Nested paragraph"))],
  }),
]);
```

- Factories that take `children` infer the child block types, so nested factory output matches the SDK request types.
- One request can nest children two levels below the top-level block. Append deeper content in a second request.

Media factories take `{ type: "external", url }` or `{ type: "file_upload", id }`. Upload the file with the SDK's `fileUploads` API first, then pass the upload ID.

The factories return plain objects; you can compose them, clone them, or store them in your own abstraction before sending them to Notion.
