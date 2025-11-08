import type {
  BlockObjectResponse,
  BulletedListItemBlockObjectResponse,
  CalloutBlockObjectResponse,
  ChildDatabaseBlockObjectResponse,
  ChildPageBlockObjectResponse,
  ColumnBlockObjectResponse,
  ColumnListBlockObjectResponse,
  DividerBlockObjectResponse,
  Heading1BlockObjectResponse,
  Heading2BlockObjectResponse,
  Heading3BlockObjectResponse,
  NumberedListItemBlockObjectResponse,
  ParagraphBlockObjectResponse,
  QuoteBlockObjectResponse,
  TableBlockObjectResponse,
  ToDoBlockObjectResponse,
  ToggleBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { BaseRenderer } from "@/transform/base-renderer";
import type { BlockNode, RenderContext } from "@/types/markdown";
import { renderBookmark, renderEmbed, renderFile, renderImage, renderPdf, renderAudio, renderVideo } from "./blocks/media";
import { renderBulleted, renderNumbered, renderTodo } from "./blocks/lists";
import { renderCallout, renderQuote } from "./blocks/quotes";
import { renderParagraph, renderHeading } from "./blocks/text";
import { renderCode, renderDivider, renderEquation } from "./blocks/basic";
import { renderToggle } from "./blocks/toggle";
import { renderTable } from "./blocks/table";
import { renderColumn, renderColumnList, renderSyncedBlock } from "./blocks/structure";
import { renderChildDatabase, renderChildPage } from "./blocks/page";
import { renderRichText as defaultRenderRichText } from "./richtext";

export class MarkdownRenderer extends BaseRenderer {
  protected renderRichText(items: Parameters<typeof defaultRenderRichText>[0], _ctx: RenderContext): string {
    return defaultRenderRichText(items);
  }

  protected renderBlock(block: BlockNode, ctx: RenderContext): string[] {
    switch (block.type) {
      case "paragraph":
        return renderParagraph(block as ParagraphBlockObjectResponse & BlockNode, ctx);
      case "heading_1":
      case "heading_2":
      case "heading_3":
        return renderHeading(
          block as (Heading1BlockObjectResponse | Heading2BlockObjectResponse | Heading3BlockObjectResponse) & BlockNode,
          ctx
        );
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
        return renderCode(block as BlockNode);
      case "divider":
        return renderDivider(block as DividerBlockObjectResponse & BlockNode);
      case "image":
        return renderImage(block as BlockNode, ctx);
      case "video":
        return renderVideo(block as BlockNode, ctx);
      case "audio":
        return renderAudio(block as BlockNode, ctx);
      case "pdf":
        return renderPdf(block as BlockNode, ctx);
      case "file":
        return renderFile(block as BlockNode, ctx);
      case "bookmark":
        return renderBookmark(block as BlockNode, ctx);
      case "embed":
        return renderEmbed(block as BlockNode, ctx);
      case "equation":
        return renderEquation(block as BlockNode);
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
        return renderChildPage(block as ChildPageBlockObjectResponse & BlockNode);
      case "child_database":
        return renderChildDatabase(block as ChildDatabaseBlockObjectResponse & BlockNode);
      default:
        return ctx.options.onUnsupportedBlock(block);
    }
  }
}
