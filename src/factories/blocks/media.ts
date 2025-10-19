/**
 * Media block factories for Notion API
 * Includes image, video, embed, bookmark, PDF, file, and audio blocks
 */

import type { RichTextItemRequest, FileSource } from "@/types/blocks";

/**
 * Builds an image block
 *
 * @param source - Image source (external URL or file)
 * @param caption - Optional caption as rich text array
 * @returns Image block payload
 *
 * @example
 * buildImageBlock({ type: "external", url: "https://example.com/image.png" })
 * buildImageBlock(
 *   { type: "external", url: "https://example.com/image.png" },
 *   [{ type: "text", text: { content: "Figure 1: Example" } }]
 * )
 */
export function buildImageBlock(
  source: FileSource,
  caption?: RichTextItemRequest[]
) {
  if (source.type === "external") {
    return {
      type: "image" as const,
      image: {
        type: "external" as const,
        external: { url: source.url },
        ...(caption && { caption }),
      },
    };
  }

  return {
    type: "image" as const,
    image: {
      type: "file" as const,
      file: { url: source.url },
      ...(caption && { caption }),
    },
  };
}

/**
 * Builds a video block
 *
 * @param source - Video source (external URL or file)
 * @param caption - Optional caption as rich text array
 * @returns Video block payload
 *
 * @example
 * buildVideoBlock({ type: "external", url: "https://youtube.com/watch?v=..." })
 */
export function buildVideoBlock(
  source: FileSource,
  caption?: RichTextItemRequest[]
) {
  if (source.type === "external") {
    return {
      type: "video" as const,
      video: {
        type: "external" as const,
        external: { url: source.url },
        ...(caption && { caption }),
      },
    };
  }

  return {
    type: "video" as const,
    video: {
      type: "file" as const,
      file: { url: source.url },
      ...(caption && { caption }),
    },
  };
}

/**
 * Builds a bookmark block
 *
 * @param url - URL to bookmark
 * @param caption - Optional caption as rich text array
 * @returns Bookmark block payload
 *
 * @example
 * buildBookmarkBlock("https://notion.so")
 * buildBookmarkBlock(
 *   "https://notion.so",
 *   [{ type: "text", text: { content: "Notion homepage" } }]
 * )
 */
export function buildBookmarkBlock(
  url: string,
  caption?: RichTextItemRequest[]
) {
  return {
    type: "bookmark" as const,
    bookmark: {
      url,
      ...(caption && { caption }),
    },
  };
}

/**
 * Builds an embed block
 *
 * @param url - URL to embed
 * @param caption - Optional caption as rich text array
 * @returns Embed block payload
 *
 * @example
 * buildEmbedBlock("https://www.figma.com/embed?...")
 */
export function buildEmbedBlock(
  url: string,
  caption?: RichTextItemRequest[]
) {
  return {
    type: "embed" as const,
    embed: {
      url,
      ...(caption && { caption }),
    },
  };
}

/**
 * Builds a PDF block
 *
 * @param source - PDF source (external URL or file)
 * @param caption - Optional caption as rich text array
 * @returns PDF block payload
 *
 * @example
 * buildPdfBlock({ type: "external", url: "https://example.com/doc.pdf" })
 */
export function buildPdfBlock(
  source: FileSource,
  caption?: RichTextItemRequest[]
) {
  if (source.type === "external") {
    return {
      type: "pdf" as const,
      pdf: {
        type: "external" as const,
        external: { url: source.url },
        ...(caption && { caption }),
      },
    };
  }

  return {
    type: "pdf" as const,
    pdf: {
      type: "file" as const,
      file: { url: source.url },
      ...(caption && { caption }),
    },
  };
}

/**
 * Builds a file block
 *
 * @param source - File source (external URL or file)
 * @param name - Optional file name
 * @param caption - Optional caption as rich text array
 * @returns File block payload
 *
 * @example
 * buildFileBlock({ type: "external", url: "https://example.com/file.zip" }, "archive.zip")
 */
export function buildFileBlock(
  source: FileSource,
  name?: string,
  caption?: RichTextItemRequest[]
) {
  if (source.type === "external") {
    return {
      type: "file" as const,
      file: {
        type: "external" as const,
        external: { url: source.url },
        ...(name && { name }),
        ...(caption && { caption }),
      },
    };
  }

  return {
    type: "file" as const,
    file: {
      type: "file" as const,
      file: { url: source.url },
      ...(name && { name }),
      ...(caption && { caption }),
    },
  };
}

/**
 * Builds an audio block
 *
 * @param source - Audio source (external URL or file)
 * @param caption - Optional caption as rich text array
 * @returns Audio block payload
 *
 * @example
 * buildAudioBlock({ type: "external", url: "https://example.com/audio.mp3" })
 */
export function buildAudioBlock(
  source: FileSource,
  caption?: RichTextItemRequest[]
) {
  if (source.type === "external") {
    return {
      type: "audio" as const,
      audio: {
        type: "external" as const,
        external: { url: source.url },
        ...(caption && { caption }),
      },
    };
  }

  return {
    type: "audio" as const,
    audio: {
      type: "file" as const,
      file: { url: source.url },
      ...(caption && { caption }),
    },
  };
}
