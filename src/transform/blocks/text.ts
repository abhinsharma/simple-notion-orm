import type { ApiColor } from "@/types/blocks";
import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import type {
  PageBlock,
  SimpleBlock,
  SimpleHeadingBlock,
  SimpleListItemBlock,
  SimpleParagraphBlock,
  SimpleQuoteBlock,
  SimpleToDoBlock,
  SimpleToggleBlock,
} from "./types";
import { normalizeColor, toSimpleRichTextSpanArray } from "./richtext";

export function fromParagraph(block: Extract<PageBlock, { type: "paragraph" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleParagraphBlock {
  const paragraph = block.paragraph;
  const simple: SimpleParagraphBlock = {
    type: "paragraph",
    id: block.id,
    text: toSimpleRichTextSpanArray(paragraph.rich_text),
  };

  const color = normalizeColor(paragraph.color);
  if (color) {
    simple.color = color;
  }

  attachChildren(simple, block, transformChild);
  return simple;
}

export function fromHeading(
  block: Extract<PageBlock, { type: "heading_1" | "heading_2" | "heading_3" }>,
  transformChild: (child: PageBlock) => SimpleBlock
): SimpleHeadingBlock {
  if (block.type === "heading_1") {
    return buildHeadingBlock(block, block.heading_1, "heading_1", 1, transformChild);
  }

  if (block.type === "heading_2") {
    return buildHeadingBlock(block, block.heading_2, "heading_2", 2, transformChild);
  }

  return buildHeadingBlock(block, block.heading_3, "heading_3", 3, transformChild);
}

export function fromListItem(
  block: Extract<PageBlock, { type: "bulleted_list_item" | "numbered_list_item" }>,
  transformChild: (child: PageBlock) => SimpleBlock
): SimpleListItemBlock {
  if (block.type === "bulleted_list_item") {
    return buildListItemBlock(block, block.bulleted_list_item, "bulleted_list_item", transformChild);
  }

  return buildListItemBlock(block, block.numbered_list_item, "numbered_list_item", transformChild);
}

export function fromToDo(block: Extract<PageBlock, { type: "to_do" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleToDoBlock {
  const todo = block.to_do;
  const simple: SimpleToDoBlock = {
    type: "to_do",
    id: block.id,
    text: toSimpleRichTextSpanArray(todo.rich_text),
  };

  const color = normalizeColor(todo.color);
  if (color) {
    simple.color = color;
  }

  if (todo.checked) {
    simple.checked = true;
  }

  attachChildren(simple, block, transformChild);
  return simple;
}

export function fromToggle(block: Extract<PageBlock, { type: "toggle" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleToggleBlock {
  const toggle = block.toggle;
  const simple: SimpleToggleBlock = {
    type: "toggle",
    id: block.id,
    summary: toSimpleRichTextSpanArray(toggle.rich_text),
  };

  const color = normalizeColor(toggle.color);
  if (color) {
    simple.color = color;
  }

  attachChildren(simple, block, transformChild);
  return simple;
}

export function fromQuote(block: Extract<PageBlock, { type: "quote" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleQuoteBlock {
  const quote = block.quote;
  const simple: SimpleQuoteBlock = {
    type: "quote",
    id: block.id,
    text: toSimpleRichTextSpanArray(quote.rich_text),
  };

  const color = normalizeColor(quote.color);
  if (color) {
    simple.color = color;
  }

  attachChildren(simple, block, transformChild);
  return simple;
}

function attachChildren<T extends { children?: SimpleBlock[] }>(target: T, block: PageBlock, transformChild: (child: PageBlock) => SimpleBlock): T {
  if (block.children?.length) {
    target.children = block.children.map(transformChild);
  }
  return target;
}

function buildHeadingBlock(
  block: Pick<PageBlock, "id" | "children">,
  payload: { rich_text: RichTextItemResponse[]; color: ApiColor; is_toggleable?: boolean },
  type: SimpleHeadingBlock["type"],
  level: SimpleHeadingBlock["level"],
  transformChild: (child: PageBlock) => SimpleBlock
): SimpleHeadingBlock {
  const simple: SimpleHeadingBlock = {
    type,
    id: block.id,
    level,
    text: toSimpleRichTextSpanArray(payload.rich_text),
  };

  if (payload.is_toggleable) {
    simple.isToggleable = true;
  }

  const color = normalizeColor(payload.color);
  if (color) {
    simple.color = color;
  }

  attachChildren(simple, block as PageBlock, transformChild);
  return simple;
}

function buildListItemBlock(
  block: Pick<PageBlock, "id" | "children">,
  payload: { rich_text: RichTextItemResponse[]; color: ApiColor },
  type: SimpleListItemBlock["type"],
  transformChild: (child: PageBlock) => SimpleBlock
): SimpleListItemBlock {
  const simple: SimpleListItemBlock = {
    type,
    id: block.id,
    text: toSimpleRichTextSpanArray(payload.rich_text),
  };

  const color = normalizeColor(payload.color);
  if (color) {
    simple.color = color;
  }

  attachChildren(simple, block as PageBlock, transformChild);
  return simple;
}
