import type { IconType, Language, ApiColor } from "@/types/blocks";
import type { BlockObjectResponse, RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

export type PageBlock = BlockObjectResponse & { children?: PageBlock[] };

export type RichTextResponse = RichTextItemResponse;

export type NonDefaultColor = Exclude<ApiColor, "default">;

export type SimpleAnnotations = {
  bold?: true;
  italic?: true;
  underline?: true;
  strikethrough?: true;
  code?: true;
  color?: NonDefaultColor;
};

export type SimpleRichTextSpan = {
  plainText: string;
  href?: string | null;
  annotations?: SimpleAnnotations;
};

export type SimpleParagraphBlock = {
  type: "paragraph";
  id: string;
  text: SimpleRichTextSpan[];
  color?: NonDefaultColor;
  children?: SimpleBlock[];
};

export type SimpleHeadingBlock = {
  type: "heading_1" | "heading_2" | "heading_3";
  id: string;
  level: 1 | 2 | 3;
  text: SimpleRichTextSpan[];
  isToggleable?: true;
  color?: NonDefaultColor;
  children?: SimpleBlock[];
};

export type SimpleListItemBlock = {
  type: "bulleted_list_item" | "numbered_list_item";
  id: string;
  text: SimpleRichTextSpan[];
  color?: NonDefaultColor;
  children?: SimpleBlock[];
};

export type SimpleToDoBlock = {
  type: "to_do";
  id: string;
  text: SimpleRichTextSpan[];
  checked?: true;
  color?: NonDefaultColor;
  children?: SimpleBlock[];
};

export type SimpleToggleBlock = {
  type: "toggle";
  id: string;
  summary: SimpleRichTextSpan[];
  color?: NonDefaultColor;
  children?: SimpleBlock[];
};

export type SimpleQuoteBlock = {
  type: "quote";
  id: string;
  text: SimpleRichTextSpan[];
  color?: NonDefaultColor;
  children?: SimpleBlock[];
};

export type SimpleMediaBlock = {
  type: "image" | "video" | "pdf" | "file" | "audio";
  id: string;
  source: {
    kind: "external" | "file";
    url: string;
    name?: string;
  };
  caption?: SimpleRichTextSpan[];
};

export type SimpleBookmarkBlock = {
  type: "bookmark" | "embed";
  id: string;
  url: string;
  caption?: SimpleRichTextSpan[];
};

export type SimpleDividerBlock = {
  type: "divider";
  id: string;
};

export type SimpleBreadcrumbBlock = {
  type: "breadcrumb";
  id: string;
};

export type SimpleTableOfContentsBlock = {
  type: "table_of_contents";
  id: string;
  color?: NonDefaultColor;
};

export type SimpleColumnListBlock = {
  type: "column_list";
  id: string;
  columns: Array<{
    id: string;
    children: SimpleBlock[];
  }>;
};

export type SimpleColumnBlock = {
  type: "column";
  id: string;
  widthRatio?: number;
  children?: SimpleBlock[];
};

export type SimpleTableBlock = {
  type: "table";
  id: string;
  hasColumnHeader: boolean;
  hasRowHeader: boolean;
  tableWidth: number;
  rows: SimpleRichTextSpan[][][];
};

export type SimpleTableRowBlock = {
  type: "table_row";
  id: string;
  cells: SimpleRichTextSpan[][];
};

export type SimpleCodeBlock = {
  type: "code";
  id: string;
  language: Language;
  text: SimpleRichTextSpan[];
  caption?: SimpleRichTextSpan[];
};

export type SimpleCalloutBlock = {
  type: "callout";
  id: string;
  text: SimpleRichTextSpan[];
  icon?: IconType;
  color?: NonDefaultColor;
  children?: SimpleBlock[];
};

export type SimpleEquationBlock = {
  type: "equation";
  id: string;
  expression: string;
};

export type SimpleSyncedBlock = {
  type: "synced_block";
  id: string;
  kind: "source" | "reference";
  sourceBlockId: string;
  children?: SimpleBlock[];
};

export type SimpleLinkToPageBlock = {
  type: "link_to_page";
  id: string;
  target: { kind: "page" | "database" | "comment"; id: string };
};

export type SimpleLinkPreviewBlock = {
  type: "link_preview";
  id: string;
  url: string;
};

export type SimpleTemplateBlock = {
  type: "template";
  id: string;
  text: SimpleRichTextSpan[];
  children?: SimpleBlock[];
};

export type SimpleChildDatabaseBlock = {
  type: "child_database";
  id: string;
  databaseId: string;
  title: string;
};

export type SimpleChildPageBlock = {
  type: "child_page";
  id: string;
  pageId: string;
  title: string;
  children?: SimpleBlock[];
};

export type SimpleUnsupportedBlock = {
  type: "unsupported";
  id: string;
};

export type SimpleBlock =
  | SimpleParagraphBlock
  | SimpleHeadingBlock
  | SimpleListItemBlock
  | SimpleToDoBlock
  | SimpleToggleBlock
  | SimpleQuoteBlock
  | SimpleMediaBlock
  | SimpleBookmarkBlock
  | SimpleDividerBlock
  | SimpleBreadcrumbBlock
  | SimpleTableOfContentsBlock
  | SimpleColumnListBlock
  | SimpleColumnBlock
  | SimpleTableBlock
  | SimpleTableRowBlock
  | SimpleCodeBlock
  | SimpleCalloutBlock
  | SimpleEquationBlock
  | SimpleSyncedBlock
  | SimpleLinkToPageBlock
  | SimpleLinkPreviewBlock
  | SimpleTemplateBlock
  | SimpleChildDatabaseBlock
  | SimpleChildPageBlock
  | SimpleUnsupportedBlock;
