import type {
  BulletedListItemBlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ToDoBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { indent } from "../utils";
import type { BlockNode, RenderContext } from "@/types/markdown";

export function renderBulleted(block: BulletedListItemBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const line = `${indent(ctx)}- ${ctx.renderRichText(block.bulleted_list_item.rich_text)}`;
  const lines = [line];
  if (block.children?.length) {
    lines.push(...ctx.renderChildren(block.children, 1));
  }
  return lines;
}

export function renderNumbered(block: NumberedListItemBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const line = `${indent(ctx)}1. ${ctx.renderRichText(block.numbered_list_item.rich_text)}`;
  const lines = [line];
  if (block.children?.length) {
    lines.push(...ctx.renderChildren(block.children, 1));
  }
  return lines;
}

export function renderTodo(block: ToDoBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const box = block.to_do.checked ? "x" : " ";
  const line = `${indent(ctx)}- [${box}] ${ctx.renderRichText(block.to_do.rich_text)}`;
  const lines = [line];
  if (block.children?.length) {
    lines.push(...ctx.renderChildren(block.children, 1));
  }
  return lines;
}
