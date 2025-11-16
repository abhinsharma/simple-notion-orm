import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import type { PageBlock, SimpleBookmarkBlock, SimpleMediaBlock } from "./types";
import { toSimpleRichTextSpanArray } from "./richtext";

export function fromMedia(block: PageBlock): SimpleMediaBlock {
  switch (block.type) {
    case "image": {
      const imageBlock = block as Extract<PageBlock, { type: "image" }>;
      return buildMediaBlock(imageBlock, imageBlock.image, "image");
    }
    case "video": {
      const videoBlock = block as Extract<PageBlock, { type: "video" }>;
      return buildMediaBlock(videoBlock, videoBlock.video, "video");
    }
    case "pdf": {
      const pdfBlock = block as Extract<PageBlock, { type: "pdf" }>;
      return buildMediaBlock(pdfBlock, pdfBlock.pdf, "pdf");
    }
    case "file": {
      const fileBlock = block as Extract<PageBlock, { type: "file" }>;
      return buildMediaBlock(fileBlock, fileBlock.file, "file");
    }
    case "audio": {
      const audioBlock = block as Extract<PageBlock, { type: "audio" }>;
      return buildMediaBlock(audioBlock, audioBlock.audio, "audio");
    }
    default:
      throw new Error(`Unsupported media block type: ${block.type}`);
  }
}

export function fromBookmark(block: Extract<PageBlock, { type: "bookmark" | "embed" }>): SimpleBookmarkBlock {
  if (block.type === "bookmark") {
    return {
      type: "bookmark",
      id: block.id,
      url: block.bookmark.url,
      caption: block.bookmark.caption ? toSimpleRichTextSpanArray(block.bookmark.caption) : undefined,
    };
  }

  return {
    type: "embed",
    id: block.id,
    url: block.embed.url,
    caption: block.embed.caption ? toSimpleRichTextSpanArray(block.embed.caption) : undefined,
  };
}

type MediaPayload =
  | ({ type: "external"; external: { url: string } } & { caption?: RichTextItemResponse[]; name?: string })
  | ({ type: "file"; file: { url: string } } & { caption?: RichTextItemResponse[]; name?: string });

function buildMediaBlock(block: Pick<PageBlock, "id">, payload: MediaPayload, type: SimpleMediaBlock["type"]): SimpleMediaBlock {
  const isExternal = payload.type === "external";
  const source = isExternal ? payload.external : payload.file;

  return {
    type,
    id: block.id,
    source: {
      kind: isExternal ? "external" : "file",
      url: source.url,
      name: "name" in payload ? payload.name : undefined,
    },
    caption: payload.caption ? toSimpleRichTextSpanArray(payload.caption) : undefined,
  };
}
