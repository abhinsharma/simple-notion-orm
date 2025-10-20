import type { RenderContext } from "@/types/markdown";

export function indent(ctx: RenderContext): string {
  return " ".repeat(ctx.options.listIndent * ctx.indentLevel);
}

export function splitLines(value: string): string[] {
  return value.length ? value.split(/\r?\n/) : [""];
}
