import type {
  ChildDatabaseBlockObjectResponse,
  ChildPageBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { BlockNode } from "@/types/markdown";

export function renderChildPage(block: ChildPageBlockObjectResponse & BlockNode): string[] {
  return [`### ${block.child_page.title}`];
}

export function renderChildDatabase(block: ChildDatabaseBlockObjectResponse & BlockNode): string[] {
  return [`### ${block.child_database.title}`];
}
