# Markdown Rendering Utilities

| API                        | Returns                    | Description                                                                  |
| -------------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| `renderMarkdown`           | `{ markdown: string }`     | Convert an expanded Notion block tree into Markdown.                         |
| `renderMarkdownByPageId`   | `Promise<{ markdown: string }>` | Fetch a page's block tree and return its Markdown representation.       |
| `loadBlockTree`            | `Promise<BlockNode[]>`     | Fetch a Notion block tree with child blocks eagerly expanded.                |
| `MarkdownRenderer`         | `MarkdownRenderer`         | Class wrapper that exposes `.render(blocks)` for custom renderer instances.  |

All utilities live under `@/transform/markdown`.

## Render expanded blocks

When you already have a block tree (for instance inside a test or after batching API calls) call `renderMarkdown`.

```ts
import { renderMarkdown } from "@/transform/markdown";
import type { BlockNode } from "@/transform/markdown";

const blocks: BlockNode[] = /* obtain from fixtures or API */;
const { markdown } = renderMarkdown(blocks);

console.log(markdown);
```

## Render by page id

To convert a Notion page without prefetching blocks, use `renderMarkdownByPageId`. The helper loads the block tree (pagination aware, follows synced blocks) before rendering.

```ts
import { renderMarkdownByPageId } from "@/transform/markdown";

const { markdown } = await renderMarkdownByPageId("notion-page-id");

console.log(markdown);
```

## Fetch block trees directly

`loadBlockTree` is exported when you need to cache or inspect the expanded blocks before rendering.

```ts
import { loadBlockTree } from "@/transform/markdown";

const blocks = await loadBlockTree("notion-page-or-block-id");
```

## Renderer options

Every helper accepts an optional `RenderOptions` object:

```ts
type RenderOptions = {
  listIndent?: number; // default 2 spaces per nesting level
  toggleStyle?: "details" | "nested"; // default "details"
  column?: {
    delimiter?: string; // default "\n<!-- COLUMN -->\n"
    emitMetadata?: boolean; // default true
  };
  imageRenderer?: (url: string, caption?: string) => string; // custom image serialization
  onUnsupportedBlock?: (block: BlockObjectResponse) => string[]; // fallback renderer
};
```

### Toggle styles

`toggleStyle: "details"` (default) renders HTML `<details>` elements. Setting `toggleStyle: "nested"` emits a Markdown list item and nests children underneath, which can be useful for plain-text renderers such as CLIs.

### Column metadata

Column lists emit metadata fences by default:

```
<!-- COLUMNS count=n -->
...column content...
<!-- /COLUMNS -->
```

Provide a custom delimiter or disable metadata entirely via `column.emitMetadata: false`.

### Custom image rendering

Pass `imageRenderer` when you need an alternative format (for example, to emit local asset paths):

```ts
const { markdown } = renderMarkdown(blocks, {
  imageRenderer: (url, caption) => `![${caption ?? "Image"}](/assets/${url})`,
});
```

### Unsupported block callback

Blocks that are not yet handled call `onUnsupportedBlock`. Override it to collect metrics or raise errors in strict environments.

```ts
const { markdown } = renderMarkdown(blocks, {
  onUnsupportedBlock: (block) => [`<!-- TODO: handle ${block.type} -->`],
});
```
