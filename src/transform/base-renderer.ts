import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import type { BlockNode, NormalizedRenderOptions, RenderContext, RenderOptions } from "@/types/markdown";

function normalizeOptions(options?: RenderOptions): NormalizedRenderOptions {
  return {
    listIndent: options?.listIndent ?? 2,
    toggleStyle: options?.toggleStyle ?? "details",
    column: {
      delimiter: options?.column?.delimiter ?? "\n<!-- COLUMN -->\n",
      emitMetadata: options?.column?.emitMetadata ?? true,
    },
    imageRenderer: options?.imageRenderer ?? ((url, caption) => `![${caption ?? ""}](${url})`),
    onUnsupportedBlock:
      options?.onUnsupportedBlock ?? ((block) => [`<!-- Unsupported block: ${block.type} -->`]),
  };
}

function collapseBlankLines(lines: string[]): string[] {
  const output: string[] = [];
  let lastWasBlank = false;
  for (const line of lines) {
    const isBlank = line.trim().length === 0;
    if (isBlank) {
      if (!lastWasBlank) {
        output.push("");
      }
      lastWasBlank = true;
    } else {
      output.push(line);
      lastWasBlank = false;
    }
  }

  while (output.length && output[0].trim() === "") {
    output.shift();
  }
  while (output.length && output[output.length - 1].trim() === "") {
    output.pop();
  }

  return output;
}

export abstract class BaseRenderer {
  protected readonly options: NormalizedRenderOptions;
  private readonly context: RenderContext;

  constructor(options?: RenderOptions) {
    this.options = normalizeOptions(options);
    this.context = {
      options: this.options,
      indentLevel: 0,
      renderRichText: (items) => this.renderRichText(items, this.context),
      renderChildren: (children, indentDelta = 0) => this.renderChildren(children, indentDelta),
    };
  }

  public render(blocks: BlockNode[]): string {
    const lines: string[] = [];
    for (const block of blocks) {
      lines.push(...this.renderBlock(block, this.context));
    }
    const finalized = this.finalize(lines, this.context);
    this.context.indentLevel = 0;
    return collapseBlankLines(finalized).join("\n");
  }

  protected getContext(): RenderContext {
    return this.context;
  }

  protected renderChildren(children?: BlockNode[], indentDelta = 0): string[] {
    if (!children?.length) {
      return [];
    }
    const previousIndent = this.context.indentLevel;
    this.context.indentLevel = previousIndent + indentDelta;
    const childLines: string[] = [];
    for (const child of children) {
      childLines.push(...this.renderBlock(child, this.context));
    }
    this.context.indentLevel = previousIndent;
    return childLines;
  }

  protected finalize(lines: string[], _ctx: RenderContext): string[] {
    return lines;
  }

  protected abstract renderBlock(block: BlockNode, ctx: RenderContext): string[];

  protected abstract renderRichText(items: RichTextItemResponse[], ctx: RenderContext): string;
}
