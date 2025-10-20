import type {
  AudioBlockObjectResponse,
  BlockObjectResponse,
  BookmarkBlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  CalloutBlockObjectResponse,
  CodeBlockObjectResponse,
  ColumnBlockObjectResponse,
  ColumnListBlockObjectResponse,
  DividerBlockObjectResponse,
  EmbedBlockObjectResponse,
  EquationBlockObjectResponse,
  FileBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  ImageBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ParagraphBlockObjectResponse,
  PdfBlockObjectResponse,
  QuoteBlockObjectResponse,
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
  ToDoBlockObjectResponse,
  ToggleBlockObjectResponse,
  VideoBlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { BaseRenderer } from "@/transform/base-renderer";
import { getPlainText, renderRichText as defaultRenderRichText } from "./richtext";
import type { BlockNode, RenderContext } from "./types";

function indent(ctx: RenderContext): string {
  return " ".repeat(ctx.options.listIndent * ctx.indentLevel);
}

function splitLines(value: string): string[] {
  return value.length ? value.split(/\r?\n/) : [""];
}

function renderParagraph(block: ParagraphBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const text = ctx.renderRichText(block.paragraph.rich_text);
  const lines = splitLines(text);
  if (ctx.indentLevel > 0) {
    const prefix = indent(ctx);
    return lines.map((line) => (line.trim().length ? `${prefix}${line}` : ""));
  }
  return lines;
}

function renderHeading(
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

function renderBulleted(block: BulletedListItemBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const line = `${indent(ctx)}- ${ctx.renderRichText(block.bulleted_list_item.rich_text)}`;
  const lines = [line];
  if (block.children?.length) {
    lines.push(...ctx.renderChildren(block.children, 1));
  }
  return lines;
}

function renderNumbered(block: NumberedListItemBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const line = `${indent(ctx)}1. ${ctx.renderRichText(block.numbered_list_item.rich_text)}`;
  const lines = [line];
  if (block.children?.length) {
    lines.push(...ctx.renderChildren(block.children, 1));
  }
  return lines;
}

function renderTodo(block: ToDoBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const box = block.to_do.checked ? "x" : " ";
  const line = `${indent(ctx)}- [${box}] ${ctx.renderRichText(block.to_do.rich_text)}`;
  const lines = [line];
  if (block.children?.length) {
    lines.push(...ctx.renderChildren(block.children, 1));
  }
  return lines;
}

function renderQuote(block: QuoteBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
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

function renderCallout(block: CalloutBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
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

function renderCode(block: CodeBlockObjectResponse & BlockNode): string[] {
  const language = block.code.language || "";
  const content = getPlainText(block.code.rich_text);
  const lines = content.split(/\r?\n/);
  return [
    `\`\`\`${language}`,
    ...lines,
    "```",
  ];
}

function renderDivider(_block: DividerBlockObjectResponse & BlockNode): string[] {
  return ["---"];
}

function renderImage(block: ImageBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.image.caption?.length ? ctx.renderRichText(block.image.caption) : undefined;
  const url = block.image.type === "external" ? block.image.external.url : block.image.file.url;
  return [ctx.options.imageRenderer(url, caption)];
}

function renderMediaLink(url: string, caption: string | undefined, fallback: string): string[] {
  const label = caption && caption.trim().length ? caption : fallback;
  return [`[${label}](${url})`];
}

function renderVideo(block: VideoBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.video.caption?.length ? ctx.renderRichText(block.video.caption) : undefined;
  const url = block.video.type === "external" ? block.video.external.url : block.video.file.url;
  return renderMediaLink(url, caption, "Video");
}

function renderAudio(block: AudioBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.audio.caption?.length ? ctx.renderRichText(block.audio.caption) : undefined;
  const url = block.audio.type === "external" ? block.audio.external.url : block.audio.file.url;
  return renderMediaLink(url, caption, "Audio");
}

function renderPdf(block: PdfBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.pdf.caption?.length ? ctx.renderRichText(block.pdf.caption) : undefined;
  const url = block.pdf.type === "external" ? block.pdf.external.url : block.pdf.file.url;
  return renderMediaLink(url, caption, "PDF");
}

function renderFile(block: FileBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.file.caption?.length ? ctx.renderRichText(block.file.caption) : undefined;
  const url = block.file.type === "external" ? block.file.external.url : block.file.file.url;
  const label = caption && caption.trim().length ? caption : block.file.name ?? "File";
  return [`[${label}](${url})`];
}

function renderBookmark(block: BookmarkBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.bookmark.caption?.length ? ctx.renderRichText(block.bookmark.caption) : undefined;
  return renderMediaLink(block.bookmark.url, caption, "Bookmark");
}

function renderEmbed(block: EmbedBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.embed.caption?.length ? ctx.renderRichText(block.embed.caption) : undefined;
  return renderMediaLink(block.embed.url, caption, "Embed");
}

function renderEquation(block: EquationBlockObjectResponse & BlockNode): string[] {
  return ["$$", block.equation.expression, "$$"];
}

function renderToggle(block: ToggleBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const summary = ctx.renderRichText(block.toggle.rich_text);
  const lines: string[] = ["<details>", `<summary>${summary}</summary>`];
  if (block.children?.length) {
    const childLines = ctx.renderChildren(block.children, 0);
    for (const child of childLines) {
      lines.push(child.length ? `  ${child}` : "");
    }
  }
  lines.push("</details>");
  return lines;
}

function renderTable(block: TableBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const rows = block.children?.filter((child): child is TableRowBlockObjectResponse & BlockNode => child.type === "table_row") ?? [];
  if (!rows.length) {
    return ctx.options.onUnsupportedBlock(block);
  }

  const serializedRows = rows.map((row) => row.table_row.cells.map((cell) => ctx.renderRichText(cell)));
  const workingRows = serializedRows.map((cells) => cells.map((cell) => cell ?? ""));
  const columnCount = workingRows[0]?.length ?? 0;
  if (columnCount === 0) {
    return ctx.options.onUnsupportedBlock(block);
  }

  const rowsCopy = workingRows.map((cells) => {
    if (cells.length < columnCount) {
      return [...cells, ...Array(columnCount - cells.length).fill("")];
    }
    if (cells.length > columnCount) {
      return cells.slice(0, columnCount);
    }
    return cells;
  });

  const dataRows = [...rowsCopy];
  const headerRow = block.table.has_column_header ? dataRows.shift() : undefined;
  const resolvedHeader = headerRow ?? Array.from({ length: columnCount }, (_, index) => `Column ${index + 1}`);

  const lines: string[] = [];
  lines.push(`| ${resolvedHeader.map((cell) => (cell.trim().length ? cell : " ")).join(" | ")} |`);
  lines.push(`| ${resolvedHeader.map(() => "---").join(" | ")} |`);

  let rowsToRender: string[][];
  if (dataRows.length) {
    rowsToRender = dataRows;
  } else if (!block.table.has_column_header) {
    rowsToRender = rowsCopy;
  } else {
    rowsToRender = [];
  }
  for (const row of rowsToRender) {
    const cells = [...row];
    if (block.table.has_row_header && cells.length) {
      cells[0] = `**${cells[0]}**`;
    }
    lines.push(`| ${cells.map((cell) => (cell.trim().length ? cell : " ")).join(" | ")} |`);
  }

  return lines;
}

function renderColumnList(block: ColumnListBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
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

function renderColumn(block: ColumnBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  return ctx.renderChildren(block.children, 0);
}

function renderSyncedBlock(block: BlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  if (!block.children?.length) {
    return ctx.options.onUnsupportedBlock(block);
  }
  return ctx.renderChildren(block.children, 0);
}

export class MarkdownRenderer extends BaseRenderer {
  protected renderRichText(items: RichTextItemResponse[], _ctx: RenderContext): string {
    return defaultRenderRichText(items);
  }

  protected renderBlock(block: BlockNode, ctx: RenderContext): string[] {
    switch (block.type) {
      case "paragraph":
        return renderParagraph(block as ParagraphBlockObjectResponse & BlockNode, ctx);
      case "heading_1":
      case "heading_2":
      case "heading_3":
        return renderHeading(block as (Heading1BlockObjectResponse | Heading2BlockObjectResponse | Heading3BlockObjectResponse) & BlockNode, ctx);
      case "bulleted_list_item":
        return renderBulleted(block as BulletedListItemBlockObjectResponse & BlockNode, ctx);
      case "numbered_list_item":
        return renderNumbered(block as NumberedListItemBlockObjectResponse & BlockNode, ctx);
      case "to_do":
        return renderTodo(block as ToDoBlockObjectResponse & BlockNode, ctx);
      case "quote":
        return renderQuote(block as QuoteBlockObjectResponse & BlockNode, ctx);
      case "callout":
        return renderCallout(block as CalloutBlockObjectResponse & BlockNode, ctx);
      case "code":
        return renderCode(block as CodeBlockObjectResponse & BlockNode);
      case "divider":
        return renderDivider(block as DividerBlockObjectResponse & BlockNode);
      case "image":
        return renderImage(block as ImageBlockObjectResponse & BlockNode, ctx);
      case "video":
        return renderVideo(block as VideoBlockObjectResponse & BlockNode, ctx);
      case "audio":
        return renderAudio(block as AudioBlockObjectResponse & BlockNode, ctx);
      case "pdf":
        return renderPdf(block as PdfBlockObjectResponse & BlockNode, ctx);
      case "file":
        return renderFile(block as FileBlockObjectResponse & BlockNode, ctx);
      case "bookmark":
        return renderBookmark(block as BookmarkBlockObjectResponse & BlockNode, ctx);
      case "embed":
        return renderEmbed(block as EmbedBlockObjectResponse & BlockNode, ctx);
      case "equation":
        return renderEquation(block as EquationBlockObjectResponse & BlockNode);
      case "toggle":
        return renderToggle(block as ToggleBlockObjectResponse & BlockNode, ctx);
      case "table":
        return renderTable(block as TableBlockObjectResponse & BlockNode, ctx);
      case "column_list":
        return renderColumnList(block as ColumnListBlockObjectResponse & BlockNode, ctx);
      case "column":
        return renderColumn(block as ColumnBlockObjectResponse & BlockNode, ctx);
      case "synced_block":
        return renderSyncedBlock(block as BlockObjectResponse & BlockNode, ctx);
      case "table_row":
        return [];
      case "child_page":
        return [`### ${block.child_page.title}`];
      case "child_database":
        return [`### ${block.child_database.title}`];
      default:
        return ctx.options.onUnsupportedBlock(block);
    }
  }
}
