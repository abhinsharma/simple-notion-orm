import type { ToggleBlockObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import { indent, splitLines } from "../utils";
import type { BlockNode, RenderContext } from "@/types/markdown";

export function renderToggle(block: ToggleBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const summary = ctx.renderRichText(block.toggle.rich_text);
  if (ctx.options.toggleStyle === "nested") {
    const indentPrefix = indent(ctx);
    const summaryLines = splitLines(summary);
    const [firstLine, ...rest] = summaryLines;
    const lines: string[] = [`${indentPrefix}- ${firstLine ?? ""}`];
    rest.forEach((line) => {
      if (line.trim().length) {
        lines.push(`${indentPrefix}  ${line}`);
      } else {
        lines.push("");
      }
    });
    if (block.children?.length) {
      lines.push(...ctx.renderChildren(block.children, 1));
    }
    return lines;
  }

  const baseIndent = ctx.indentLevel > 0 ? indent(ctx) : "";
  const lines: string[] = [];
  const pushWithIndent = (value: string) => {
    if (!value.length) {
      lines.push("");
      return;
    }
    if (baseIndent) {
      lines.push(`${baseIndent}${value}`);
    } else {
      lines.push(value);
    }
  };

  pushWithIndent("<details>");
  pushWithIndent(`<summary>${summary}</summary>`);
  if (block.children?.length) {
    const childLines = ctx.renderChildren(block.children, 1);
    for (const child of childLines) {
      lines.push(child);
    }
  }
  pushWithIndent("</details>");
  return lines;
}
