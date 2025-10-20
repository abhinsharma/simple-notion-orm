import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";

const MARKDOWN_ESCAPE_PATTERN = /[\\`*_{}\[\]()#+\-.!|]/g;

function escapeMarkdown(value: string): string {
  return value.replace(MARKDOWN_ESCAPE_PATTERN, (match) => `\\${match}`);
}

function wrapAnnotations(text: string, annotations?: RichTextItemResponse["annotations"]): string {
  if (!annotations) {
    return text;
  }

  let output = text;

  if (annotations.code) {
    output = output.replace(/`/g, "``");
    output = `\`${output}\``;
  }
  if (annotations.bold) {
    output = `**${output}**`;
  }
  if (annotations.italic) {
    output = `*${output}*`;
  }
  if (annotations.strikethrough) {
    output = `~~${output}~~`;
  }
  if (annotations.underline) {
    output = `<u>${output}</u>`;
  }

  return output;
}

function renderMention(item: Extract<RichTextItemResponse, { type: "mention" }>): string {
  const annotations = item.annotations;
  switch (item.mention.type) {
    case "user": {
      const label = item.plain_text || "@user";
      return wrapAnnotations(escapeMarkdown(label), annotations);
    }
    case "page": {
      const label = item.plain_text || "@page";
      const url = item.href ?? `https://www.notion.so/${item.mention.page.id.replace(/-/g, "")}`;
      return `[${wrapAnnotations(escapeMarkdown(label), annotations)}](${url})`;
    }
    case "database": {
      const label = item.plain_text || "@database";
      const url = item.href ?? `https://www.notion.so/${item.mention.database.id.replace(/-/g, "")}`;
      return `[${wrapAnnotations(escapeMarkdown(label), annotations)}](${url})`;
    }
    case "date": {
      const label = item.plain_text || item.mention.date?.start || "@date";
      return wrapAnnotations(escapeMarkdown(label), annotations);
    }
    case "link_preview": {
      const label = item.plain_text || item.mention.link_preview.url;
      const url = item.mention.link_preview.url;
      return `[${wrapAnnotations(escapeMarkdown(label), annotations)}](${url})`;
    }
    case "template_mention": {
      const label = item.plain_text || "@mention";
      return wrapAnnotations(escapeMarkdown(label), annotations);
    }
    case "link": {
      const label = item.plain_text || item.mention.link.url;
      const url = item.mention.link.url;
      return `[${wrapAnnotations(escapeMarkdown(label), annotations)}](${url})`;
    }
    default: {
      const fallback = item.plain_text || "@mention";
      return wrapAnnotations(escapeMarkdown(fallback), annotations);
    }
  }
}

export function renderRichText(items: RichTextItemResponse[]): string {
  const parts: string[] = [];

  for (const item of items) {
    if (item.type === "text") {
      const content = item.text?.content ?? "";
      const href = item.text?.link?.url ?? item.href ?? undefined;
      const escaped = wrapAnnotations(escapeMarkdown(content), item.annotations);
      if (href) {
        parts.push(`[${escaped}](${href})`);
      } else {
        parts.push(escaped);
      }
      continue;
    }

    if (item.type === "mention") {
      parts.push(renderMention(item));
      continue;
    }

    if (item.type === "equation") {
      const expr = item.equation?.expression ?? "";
      parts.push(`$${expr}$`);
      continue;
    }

    if ("plain_text" in item) {
      parts.push(item.plain_text ?? "");
    }
  }

  return parts.join("");
}

export function getPlainText(items: RichTextItemResponse[]): string {
  return items.map((item) => item.plain_text ?? (item.type === "text" ? item.text?.content ?? "" : "")).join("");
}

