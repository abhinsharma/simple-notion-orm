import type {
  AudioBlockObjectResponse,
  BookmarkBlockObjectResponse,
  EmbedBlockObjectResponse,
  FileBlockObjectResponse,
  ImageBlockObjectResponse,
  PdfBlockObjectResponse,
  VideoBlockObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { BlockNode, RenderContext } from "@/types/markdown";

function renderMediaLink(url: string, caption: string | undefined, fallback: string): string[] {
  const label = caption && caption.trim().length ? caption : fallback;
  return [`[${label}](${url})`];
}

export function renderImage(block: ImageBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.image.caption?.length ? ctx.renderRichText(block.image.caption) : undefined;
  const url = block.image.type === "external" ? block.image.external.url : block.image.file.url;
  return [ctx.options.imageRenderer(url, caption)];
}

export function renderVideo(block: VideoBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.video.caption?.length ? ctx.renderRichText(block.video.caption) : undefined;
  const url = block.video.type === "external" ? block.video.external.url : block.video.file.url;
  return renderMediaLink(url, caption, "Video");
}

export function renderAudio(block: AudioBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.audio.caption?.length ? ctx.renderRichText(block.audio.caption) : undefined;
  const url = block.audio.type === "external" ? block.audio.external.url : block.audio.file.url;
  return renderMediaLink(url, caption, "Audio");
}

export function renderPdf(block: PdfBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.pdf.caption?.length ? ctx.renderRichText(block.pdf.caption) : undefined;
  const url = block.pdf.type === "external" ? block.pdf.external.url : block.pdf.file.url;
  return renderMediaLink(url, caption, "PDF");
}

export function renderFile(block: FileBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.file.caption?.length ? ctx.renderRichText(block.file.caption) : undefined;
  const url = block.file.type === "external" ? block.file.external.url : block.file.file.url;
  const label = caption && caption.trim().length ? caption : block.file.name ?? "File";
  return [`[${label}](${url})`];
}

export function renderBookmark(block: BookmarkBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.bookmark.caption?.length ? ctx.renderRichText(block.bookmark.caption) : undefined;
  return renderMediaLink(block.bookmark.url, caption, "Bookmark");
}

export function renderEmbed(block: EmbedBlockObjectResponse & BlockNode, ctx: RenderContext): string[] {
  const caption = block.embed.caption?.length ? ctx.renderRichText(block.embed.caption) : undefined;
  return renderMediaLink(block.embed.url, caption, "Embed");
}
