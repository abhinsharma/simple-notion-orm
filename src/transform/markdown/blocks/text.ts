import type {
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ParagraphBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { indent, splitLines } from "../utils";
import type { BlockNode, RenderContext } from "@/types/markdown";

export function renderParagraph(block: ParagraphBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const text = ctx.renderRichText(block.paragraph.rich_text);
  const lines = splitLines(text);
  if (ctx.indentLevel > 0) {
    const prefix = indent(ctx);
    return lines.map((line) => (line.trim().length ? `${prefix}${line}` : ""));
  }
  return lines;
}

export function renderHeading(
  block: (Heading1BlockObjectResponse | Heading2BlockObjectResponse | Heading3BlockObjectResponse) & BlockNode,
  ctx: RenderContext
): string[] {
  let level: 1 | 2 | 3;
  let richText;
  switch (block.type) {
    case "heading_1":
      level = 1;
      richText = block.heading_1.rich_text;
      break;
    case "heading_2":
      level = 2;
      richText = block.heading_2.rich_text;
      break;
    default:
      level = 3;
      richText = block.heading_3.rich_text;
      break;
  }
  const hashes = "#".repeat(level);
  const text = ctx.renderRichText(richText);
  return [`${hashes} ${text}`];
}
