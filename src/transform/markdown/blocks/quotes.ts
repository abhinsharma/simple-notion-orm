import type {
  CalloutBlockObjectResponse,
  QuoteBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { splitLines } from "../utils";
import type { BlockNode, RenderContext } from "@/types/markdown";

export function renderQuote(block: QuoteBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const text = ctx.renderRichText(block.quote.rich_text);
  const lines: string[] = [];
  for (const line of splitLines(text)) {
    lines.push(`> ${line}`);
  }
  if (block.children?.length) {
    const childLines = ctx.renderChildren(block.children, 0);
    for (const child of childLines) {
      lines.push(child.trim().length ? `> ${child}` : ">");
    }
  }
  return lines;
}

export function renderCallout(block: CalloutBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const icon = block.callout.icon?.type === "emoji" ? `${block.callout.icon.emoji} ` : "";
  const content = ctx.renderRichText(block.callout.rich_text);
  const lines: string[] = [];
  const baseLines = splitLines(content);
  baseLines.forEach((line, index) => {
    const prefix = index === 0 ? icon : "";
    lines.push(`> ${prefix}${line}`);
  });
  if (block.children?.length) {
    const childLines = ctx.renderChildren(block.children, 0);
    for (const child of childLines) {
      lines.push(child.trim().length ? `> ${child}` : ">");
    }
  }
  return lines;
}
