# Notion Blocks Transform Design

This document describes a proposed `NotionBlocks` helper and a `transform` layer for turning verbose Notion block payloads into small, predictable JSON structures. The goal is to mirror how the ORM hides raw Notion database schemas behind table/column builders, but for the Blocks API.

## Goals

- Hide low-level Notion block JSON (parent, created_by, raw annotations, etc.) behind a minimal, app-friendly shape.
- Keep the surface strictly typed and exhaustively mapped over the block types we support via factories.
- Avoid noisy fields: no `false` flags, no `color: "default"`, no empty `children` arrays.
- Reuse the same categories as `@/factories/blocks` (`text`, `media`, `layout`, `advanced`) so it is obvious how to go from factories → raw blocks → simplified view.

## High-Level Flow

1. **NotionPage.from(pageId)**
   - Fetches `PageObjectResponse` via `getPage(pageId)`.
   - Constructs a `NotionPage` instance and attaches a `NotionBlocks` helper scoped to that page.

2. **NotionBlocks**
   - Encapsulates block traversal (`blocks.children.list`, recursion, pagination) and exposes both raw and simplified reads.
   - Lives under `src/pages/notion-blocks.ts` and is used via composition from `NotionPage`.

3. **Transform layer (`src/transform/blocks`)**
   - Converts `BlockObjectResponse` values into a discriminated `SimpleBlock` union with one branch per supported block type.
   - Handles rich text flattening, annotation cleanup, and nested children in a single place.

4. **Consumers**
   - Callers use `NotionPage` / `NotionBlocks` to fetch either raw blocks or simplified blocks depending on their needs.
   - The simplified shape is stable and testable, so MSW fixtures or downstream apps can rely on it without pulling in the full Notion SDK types.

## Phase 1 – NotionBlocks Helper

`NotionBlocks` is a read-focused helper that belongs to the pages layer but is usable independently when you only care about blocks.

### Construction

- `class NotionBlocks` (in `src/pages/notion-blocks.ts`)
  - `constructor(private readonly pageId: string) {}`
  - `static forPage(pageId: string): NotionBlocks` – convenience factory.

### Raw Retrieval Methods

All raw methods work directly with Notion SDK types and mirror the existing low-level API. They can be exposed as `*Raw` helpers or kept internal behind the transform layer:

- `listRaw(options?: { pageSize?: number; startCursor?: string }): Promise<BlockObjectResponse[]>`
  - Single-level `blocks.children.list` for the page.
  - Handles pagination internally and returns an ordered array of blocks.

- `treeRaw(options?: { pageSize?: number; recursive?: boolean }): Promise<PageBlock[]>`
  - Uses the same `collectBlockTree` logic currently inside `NotionPage`.
  - Walks `has_children` and `synced_block.synced_from` to build a nested `PageBlock[]` tree.

- `streamRaw(options?): AsyncGenerator<BlockObjectResponse>`
  - Exposes an async iterator over all blocks so callers can process large pages without building the full array.

### Transformed Retrieval Methods

Each transformed method wraps a raw retrieval call followed by a transform pass, and returns the simplified `SimpleBlock` union.

- `list(options?): Promise<SimpleBlock[]>`
  - `await this.listRaw(options)` and then `toSimpleBlocks(raw)`.

- `tree(options?): Promise<SimpleBlock[]>`
  - `await this.treeRaw(options)` and transform each node into a `SimpleBlock` with nested `children` where applicable.

- `stream(options?): AsyncGenerator<SimpleBlock>`
  - `for await (const block of this.streamRaw(options)) { yield toSimpleBlock(block); }`.

All public `NotionBlocks` methods are typed to return `SimpleBlock` by default; raw shapes remain available via the low-level API wrappers (and optionally the `*Raw` helpers) when needed.

## Phase 2 – Composition in NotionPage

`NotionPage` owns page metadata and mutation helpers; `NotionBlocks` handles block traversal and transforms.

### New Construction Path

- `static async from(pageId: string): Promise<NotionPage>`
  - Fetches `PageObjectResponse` via `getPage(pageId)`.
  - Creates a `NotionBlocks.forPage(pageId)` helper.
  - Returns a `NotionPage` instance wired with both metadata and blocks helper.

- Existing `fromPage(page: PageObjectResponse)` remains:
  - `return new NotionPage(page.id, page, new NotionBlocks(page.id));`

### New Property & Convenience Methods

- `get blocks(): NotionBlocks` – exposes the helper so callers can do `page.blocks.tree()`.

Existing methods like `getBlocks` and `get({ includeChildren })` can be reimplemented on top of `NotionBlocks` to keep the public API stable.

## Phase 3 – Transform Layer (`src/transform/blocks`)

The transform layer is responsible for converting verbose `BlockObjectResponse` values into a compact `SimpleBlock` union.

### Types

- `SimpleAnnotations`
  - Only includes truthy flags:
    - `bold?: true`
    - `italic?: true`
    - `underline?: true`
    - `strikethrough?: true`
    - `code?: true`
    - `color?: NonDefaultColor`
  - `NonDefaultColor = Exclude<ApiColor, "default">` so `"default"` never appears in the simplified shape.

- `SimpleRichTextSpan`
  - `plainText: string`
  - `href?: string` – only when Notion includes a link.
  - `annotations?: SimpleAnnotations` – omitted when everything is default.

- `SimpleBlock`
  - Discriminated union with one interface per supported block type (mirrors `@/factories/blocks`).
  - Each subtype keeps just the meaningful fields for that block:

  - **Paragraph**
    - `type: "paragraph"`
    - `id: string`
    - `text: SimpleRichTextSpan[]`
    - `color?: NonDefaultColor`
    - `children?: SimpleBlock[]`

  - **Headings** (`heading_1`, `heading_2`, `heading_3`)
    - `type: "heading_1" | "heading_2" | "heading_3"`
    - `id: string`
    - `level: 1 | 2 | 3` (derived from `type`)
    - `text: SimpleRichTextSpan[]`
    - `isToggleable?: true`
    - `children?: SimpleBlock[]`

  - **List Items**
    - Bulleted / numbered list items:
      - `type: "bulleted_list_item" | "numbered_list_item"`
      - `id: string`
      - `text: SimpleRichTextSpan[]`
      - `children?: SimpleBlock[]`
    - To-do:
      - `type: "to_do"`
      - `id: string`
      - `text: SimpleRichTextSpan[]`
      - `checked?: true`
      - `children?: SimpleBlock[]`

  - **Toggle**
    - `type: "toggle"`
    - `id: string`
    - `summary: SimpleRichTextSpan[]`
    - `children?: SimpleBlock[]`

  - **Quote**
    - `type: "quote"`
    - `id: string`
    - `text: SimpleRichTextSpan[]`
    - `color?: NonDefaultColor`
    - `children?: SimpleBlock[]`

  - **Media Blocks** (`image`, `video`, `pdf`, `file`, `audio`)
    - `type: "image" | "video" | "pdf" | "file" | "audio"`
    - `id: string`
    - `source: { kind: "external" | "file"; url: string; name?: string }`
    - `caption?: SimpleRichTextSpan[]`

  - **Bookmark / Embed**
    - `type: "bookmark" | "embed"`
    - `id: string`
    - `url: string`
    - `caption?: SimpleRichTextSpan[]`

  - **Layout Blocks**
    - Divider: `type: "divider"`, `id: string`
    - Breadcrumb: `type: "breadcrumb"`, `id: string`
    - Table of contents:
      - `type: "table_of_contents"`
      - `id: string`
      - `color?: NonDefaultColor`
    - Column list:
      - `type: "column_list"`
      - `id: string`
      - `columns: { id: string; children: SimpleBlock[] }[]`
    - Table:
      - `type: "table"`
      - `id: string`
      - `rows: SimpleRichTextSpan[][][]` (rows → cells → spans)

  - **Code**
    - `type: "code"`
    - `id: string`
    - `language: Language`
    - `text: SimpleRichTextSpan[]`
    - `caption?: SimpleRichTextSpan[]`

  - **Callout**
    - `type: "callout"`
    - `id: string`
    - `text: SimpleRichTextSpan[]`
    - `icon?: IconType`
    - `color?: NonDefaultColor`
    - `children?: SimpleBlock[]`

  - **Equation**
    - `type: "equation"`
    - `id: string`
    - `expression: string`

  - **Synced Block**
    - `type: "synced_block"`
    - `id: string`
    - `kind: "source" | "reference"`
    - `sourceBlockId: string`
    - `children?: SimpleBlock[]` (for source blocks only, or for fully hydrated references)

  - **Link to Page**
    - `type: "link_to_page"`
    - `id: string`
    - `target: { kind: "page" | "database" | "comment"; id: string }`

  - **Template**
    - `type: "template"`
    - `id: string`
    - `text: SimpleRichTextSpan[]`
    - `children?: SimpleBlock[]`

The union only covers the block types we currently support via factories; unknown types will be rejected at transform time so we can add support explicitly.

### Modules

- `src/transform/blocks/types.ts`
  - Declares `SimpleAnnotations`, `SimpleRichTextSpan`, `SimpleBlock`, and subtype interfaces.

- `src/transform/blocks/richtext.ts`
  - `toSimpleRichTextSpanArray(richText: RichTextItemResponse[]): SimpleRichTextSpan[]`.
  - Drops empty spans, strips `color: "default"`, only includes annotations when at least one flag is active.

- `src/transform/blocks/text.ts`
  - Transformers for `paragraph`, `heading_1/2/3`, list items, to-dos, toggles, quotes.

- `src/transform/blocks/media.ts`
  - Transformers for `image`, `video`, `pdf`, `file`, `audio`, `bookmark`, `embed`.

- `src/transform/blocks/layout.ts`
  - Transformers for `divider`, `breadcrumb`, `table_of_contents`, `column_list`, `table`.

- `src/transform/blocks/advanced.ts`
  - Transformers for `code`, `callout`, `equation`, `synced_block`, `link_to_page`, `template`.

- `src/transform/blocks/index.ts`
  - `toSimpleBlock(block: BlockObjectResponse): SimpleBlock` – exhaustive `switch` on `block.type`.
  - `toSimpleBlocks(blocks: BlockObjectResponse[]): SimpleBlock[]` – map helper.

## Phase 4 – Usage & Tests

Once all phases are wired, a typical usage pattern would look like this:

```ts
import { NotionPage } from "@/pages";

const page = await NotionPage.from(process.env.PLAYGROUND_PAGE_ID!);

// Fetch transformed tree of all blocks
const blocks = await page.blocks.tree({ recursive: true });

// Work with paragraphs only
const paragraphs = blocks.filter((block) => block.type === "paragraph");

// Stream transformed blocks for large pages
for await (const block of page.blocks.stream()) {
  // handle block
}
```

The simplified shapes are intentionally small and omit all default values and noisy metadata, making them easier to log, snapshot, and use in downstream tools while staying type-safe and aligned with our existing block factories.
