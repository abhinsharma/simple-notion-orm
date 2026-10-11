import type {
  PageBlock,
  SimpleBlock,
  SimpleCalloutBlock,
  SimpleChildPageBlock,
  SimpleCodeBlock,
  SimpleChildDatabaseBlock,
  SimpleEquationBlock,
  SimpleLinkToPageBlock,
  SimpleMeetingNotesBlock,
  SimpleSyncedBlock,
  SimpleTemplateBlock,
} from "./types";
import { normalizeColor, toSimpleRichTextSpanArray } from "./richtext";

export function fromCode(block: Extract<PageBlock, { type: "code" }>): SimpleCodeBlock {
  const code = block.code;
  return {
    type: "code",
    id: block.id,
    language: code.language,
    text: toSimpleRichTextSpanArray(code.rich_text),
    caption: code.caption ? toSimpleRichTextSpanArray(code.caption) : undefined,
  };
}

export function fromCallout(block: Extract<PageBlock, { type: "callout" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleCalloutBlock {
  const callout = block.callout;
  const icon = normalizeIcon(callout.icon);
  const simple: SimpleCalloutBlock = {
    type: "callout",
    id: block.id,
    text: toSimpleRichTextSpanArray(callout.rich_text),
    ...(icon ? { icon } : {}),
  };

  const color = normalizeColor(callout.color);
  if (color) {
    simple.color = color;
  }

  if (block.children?.length) {
    simple.children = block.children.map(transformChild);
  }

  return simple;
}

export function fromEquation(block: Extract<PageBlock, { type: "equation" }>): SimpleEquationBlock {
  return {
    type: "equation",
    id: block.id,
    expression: block.equation.expression,
  };
}

export function fromSyncedBlock(block: Extract<PageBlock, { type: "synced_block" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleSyncedBlock {
  const syncedBlock = block.synced_block;
  const isReference = Boolean(syncedBlock.synced_from);

  const simple: SimpleSyncedBlock = {
    type: "synced_block",
    id: block.id,
    kind: isReference ? "reference" : "source",
    sourceBlockId: syncedBlock.synced_from?.block_id ?? block.id,
  };

  if (block.children?.length) {
    simple.children = block.children.map(transformChild);
  }

  return simple;
}

export function fromLinkToPage(block: Extract<PageBlock, { type: "link_to_page" }>): SimpleLinkToPageBlock {
  const link = block.link_to_page;

  if ("page_id" in link) {
    return { type: "link_to_page", id: block.id, target: { kind: "page", id: link.page_id } };
  }

  if ("database_id" in link) {
    return { type: "link_to_page", id: block.id, target: { kind: "database", id: link.database_id } };
  }

  return { type: "link_to_page", id: block.id, target: { kind: "comment", id: link.comment_id } };
}

export function fromTemplate(block: Extract<PageBlock, { type: "template" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleTemplateBlock {
  const template = block.template;
  const simple: SimpleTemplateBlock = {
    type: "template",
    id: block.id,
    text: toSimpleRichTextSpanArray(template.rich_text),
  };

  if (block.children?.length) {
    simple.children = block.children.map(transformChild);
  }

  return simple;
}

export function fromChildDatabase(block: Extract<PageBlock, { type: "child_database" }>): SimpleChildDatabaseBlock {
  return {
    type: "child_database",
    id: block.id,
    databaseId: block.id,
    title: block.child_database.title,
  };
}

export function fromChildPage(block: Extract<PageBlock, { type: "child_page" }>, transformChild: (child: PageBlock) => SimpleBlock): SimpleChildPageBlock {
  const simple: SimpleChildPageBlock = {
    type: "child_page",
    id: block.id,
    pageId: block.id,
    title: block.child_page.title,
  };

  if (block.children?.length) {
    simple.children = block.children.map(transformChild);
  }

  return simple;
}

/**
 * API version 2026-03-11 renamed the `transcription` block to `meeting_notes`. Both map to the same simple block.
 */
export function fromMeetingNotes(block: Extract<PageBlock, { type: "meeting_notes" | "transcription" }>): SimpleMeetingNotesBlock {
  const content = block.type === "meeting_notes" ? block.meeting_notes : block.transcription;
  const children = content.children;
  return {
    type: "meeting_notes",
    id: block.id,
    title: toSimpleRichTextSpanArray(content.title ?? []),
    ...(content.status ? { status: content.status } : {}),
    ...(children?.summary_block_id ? { summaryBlockId: children.summary_block_id } : {}),
    ...(children?.notes_block_id ? { notesBlockId: children.notes_block_id } : {}),
    ...(children?.transcript_block_id ? { transcriptBlockId: children.transcript_block_id } : {}),
  };
}

type EmojiIcon = { type: "emoji"; emoji: string };
type ExternalIcon = { type: "external"; external: { url: string } };

function normalizeIcon(icon?: { type: string } | null): SimpleCalloutBlock["icon"] | undefined {
  if (!icon) {
    return undefined;
  }

  if (isEmojiIcon(icon)) {
    return { type: "emoji", emoji: icon.emoji };
  }

  if (isExternalIcon(icon)) {
    return { type: "external", external: { url: icon.external.url } };
  }

  return undefined;
}

function isEmojiIcon(icon: { type: string }): icon is EmojiIcon {
  return icon.type === "emoji";
}

function isExternalIcon(icon: { type: string }): icon is ExternalIcon {
  return icon.type === "external";
}
