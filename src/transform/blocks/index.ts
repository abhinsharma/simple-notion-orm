import type { PageBlock, SimpleBlock } from "./types";
import { fromParagraph, fromHeading, fromListItem, fromToDo, fromToggle, fromQuote } from "./text";
import { fromMedia, fromBookmark } from "./media";
import { fromDivider, fromBreadcrumb, fromColumn, fromColumnList, fromTable, fromTableRow, fromTableOfContents } from "./layout";
import { fromCallout, fromChildDatabase, fromChildPage, fromCode, fromEquation, fromLinkToPage, fromSyncedBlock, fromTemplate } from "./advanced";

export type {
  SimpleBlock,
  SimpleAnnotations,
  SimpleRichTextSpan,
  SimpleParagraphBlock,
  SimpleHeadingBlock,
  SimpleListItemBlock,
  SimpleToDoBlock,
  SimpleToggleBlock,
  SimpleQuoteBlock,
  SimpleMediaBlock,
  SimpleBookmarkBlock,
  SimpleDividerBlock,
  SimpleBreadcrumbBlock,
  SimpleTableOfContentsBlock,
  SimpleColumnListBlock,
  SimpleColumnBlock,
  SimpleTableBlock,
  SimpleTableRowBlock,
  SimpleCodeBlock,
  SimpleCalloutBlock,
  SimpleEquationBlock,
  SimpleSyncedBlock,
  SimpleLinkToPageBlock,
  SimpleLinkPreviewBlock,
  SimpleTemplateBlock,
  SimpleChildDatabaseBlock,
  SimpleChildPageBlock,
  SimpleUnsupportedBlock,
  NonDefaultColor,
  PageBlock,
} from "./types";

export { toSimpleRichTextSpanArray } from "./richtext";

export function toSimpleBlock(block: PageBlock, transformChild: (child: PageBlock) => SimpleBlock = defaultTransformChild): SimpleBlock {
  switch (block.type) {
    case "paragraph":
      return fromParagraph(block as Extract<PageBlock, { type: "paragraph" }>, transformChild);
    case "heading_1":
    case "heading_2":
    case "heading_3":
      return fromHeading(block as Extract<PageBlock, { type: "heading_1" | "heading_2" | "heading_3" }>, transformChild);
    case "bulleted_list_item":
    case "numbered_list_item":
      return fromListItem(block as Extract<PageBlock, { type: "bulleted_list_item" | "numbered_list_item" }>, transformChild);
    case "to_do":
      return fromToDo(block as Extract<PageBlock, { type: "to_do" }>, transformChild);
    case "toggle":
      return fromToggle(block as Extract<PageBlock, { type: "toggle" }>, transformChild);
    case "quote":
      return fromQuote(block as Extract<PageBlock, { type: "quote" }>, transformChild);
    case "image":
    case "video":
    case "pdf":
    case "file":
    case "audio":
      return fromMedia(block as Extract<PageBlock, { type: "image" | "video" | "pdf" | "file" | "audio" }>);
    case "bookmark":
    case "embed":
      return fromBookmark(block as Extract<PageBlock, { type: "bookmark" | "embed" }>);
    case "divider":
      return fromDivider(block as Extract<PageBlock, { type: "divider" }>);
    case "breadcrumb":
      return fromBreadcrumb(block as Extract<PageBlock, { type: "breadcrumb" }>);
    case "table_of_contents":
      return fromTableOfContents(block as Extract<PageBlock, { type: "table_of_contents" }>);
    case "column_list":
      return fromColumnList(block as Extract<PageBlock, { type: "column_list" }>, transformChild);
    case "column":
      return fromColumn(block as Extract<PageBlock, { type: "column" }>, transformChild);
    case "table":
      return fromTable(block as Extract<PageBlock, { type: "table" }>);
    case "table_row":
      return fromTableRow(block as Extract<PageBlock, { type: "table_row" }>);
    case "code":
      return fromCode(block as Extract<PageBlock, { type: "code" }>);
    case "callout":
      return fromCallout(block as Extract<PageBlock, { type: "callout" }>, transformChild);
    case "equation":
      return fromEquation(block as Extract<PageBlock, { type: "equation" }>);
    case "synced_block":
      return fromSyncedBlock(block as Extract<PageBlock, { type: "synced_block" }>, transformChild);
    case "link_to_page":
      return fromLinkToPage(block as Extract<PageBlock, { type: "link_to_page" }>);
    case "link_preview":
      return {
        type: "link_preview",
        id: block.id,
        url: (block as Extract<PageBlock, { type: "link_preview" }>).link_preview.url,
      };
    case "template":
      return fromTemplate(block as Extract<PageBlock, { type: "template" }>, transformChild);
    case "child_database":
      return fromChildDatabase(block as Extract<PageBlock, { type: "child_database" }>);
    case "child_page":
      return fromChildPage(block as Extract<PageBlock, { type: "child_page" }>, transformChild);
    case "unsupported":
      return { type: "unsupported", id: block.id };
    default: {
      const _exhaustive: never = block;
      void _exhaustive;
      throw new Error("Unsupported block type");
    }
  }
}

export function toSimpleBlocks(blocks: PageBlock[], transformChild?: (child: PageBlock) => SimpleBlock): SimpleBlock[] {
  const mapper = transformChild ?? defaultTransformChild;
  return blocks.map((block) => toSimpleBlock(block, mapper));
}

function defaultTransformChild(): SimpleBlock {
  throw new Error("Child transformation is not available in this context");
}
