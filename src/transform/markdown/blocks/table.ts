import type {
  TableBlockObjectResponse,
  TableRowBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { BlockNode, RenderContext } from "@/types/markdown";

export function renderTable(block: TableBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
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
