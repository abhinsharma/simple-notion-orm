import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { loadBlockTree } from "./fetch";
import { MarkdownRenderer } from "./renderer";
import type { BlockNode, RenderOptions, RenderResult } from "@/types/markdown";

function toBlockNodes(blocks: Array<BlockObjectResponse | BlockNode>): BlockNode[] {
  return blocks.map((block) => (block as BlockNode));
}

export { loadBlockTree, MarkdownRenderer };
export type { BlockNode, RenderOptions, RenderResult };

export function renderMarkdown(
  blocks: Array<BlockObjectResponse | BlockNode>,
  options?: RenderOptions
): RenderResult {
  const renderer = new MarkdownRenderer(options);
  const markdown = renderer.render(toBlockNodes(blocks));
  return { markdown };
}

export async function renderMarkdownByPageId(
  pageId: string,
  options?: RenderOptions
): Promise<RenderResult> {
  const blocks = await loadBlockTree(pageId);
  return renderMarkdown(blocks, options);
}
