import type {
  ColumnBlockObjectResponse,
  ColumnListBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { BlockNode, RenderContext } from "@/types/markdown";

export function renderColumnList(block: ColumnListBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const columns = block.children?.filter((child): child is ColumnBlockObjectResponse & BlockNode => child.type === "column") ?? [];
  if (!columns.length) {
    return ctx.options.onUnsupportedBlock(block);
  }

  const lines: string[] = [];
  if (ctx.options.column.emitMetadata) {
    lines.push(`<!-- COLUMNS count=${columns.length} -->`);
  }

  columns.forEach((column, index) => {
    if (index > 0) {
      lines.push(ctx.options.column.delimiter);
    }
    lines.push(...ctx.renderChildren(column.children, 0));
  });

  if (ctx.options.column.emitMetadata) {
    lines.push("<!-- /COLUMNS -->");
  }

  return lines;
}

export function renderColumn(block: ColumnBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  return ctx.renderChildren(block.children, 0);
}

export function renderSyncedBlock(block: BlockNode, ctx: RenderContext): string[] {
  if (!block.children?.length) {
    return ctx.options.onUnsupportedBlock(block);
  }
  return ctx.renderChildren(block.children, 0);
}
