import type {
  CodeBlockObjectResponse,
  DividerBlockObjectResponse,
  EquationBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getPlainText } from "../richtext";
import type { BlockNode } from "@/types/markdown";

export function renderCode(block: CodeBlockObjectResponse & BlockNode): string[] {
  const language = block.code.language || "";
  const content = getPlainText(block.code.rich_text);
  const lines = content.split(/\r?\n/);
  return [`\`\`\`${language}`, ...lines, "```"];
}

export function renderDivider(_block: DividerBlockObjectResponse & BlockNode): string[] {
  return ["---"];
}

export function renderEquation(block: EquationBlockObjectResponse & BlockNode): string[] {
  return ["$$", block.equation.expression, "$$"];
}
