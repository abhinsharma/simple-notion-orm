/**
 * Page content workflow: append nested blocks built with factories, read them back, and comment.
 *
 * Run against a real workspace:
 *   NOTION_API_KEY=... PAGE_ID=... pnpm tsx examples/page-content.ts
 *
 * Use a sandbox page. The script appends blocks to it.
 */
import { NotionPage, buildCalloutBlock, buildHeadingBlock, buildParagraphBlock, buildToggleBlock, textToRichText } from "simple-notion-orm";
import { pathToFileURL } from "node:url";
import { requireEnv } from "./env";

export async function run(env: NodeJS.ProcessEnv) {
  const page = await NotionPage.from(requireEnv(env, "PAGE_ID"));

  await page.append([
    buildHeadingBlock(4, textToRichText("Release checklist")),
    buildToggleBlock(textToRichText("Details"), {
      children: [buildParagraphBlock(textToRichText("Nested factory blocks need no casts."))],
    }),
    buildCalloutBlock(textToRichText("Sent with Notion API version 2026-03-11"), { icon: { type: "emoji", emoji: "📌" } }),
  ]);

  const blocks = await page.blocks.list();
  const comment = await page.addComment("Checklist added by the example script.");

  return {
    pageId: page.id,
    blockTypes: blocks.map((block) => block.type),
    commentId: comment.id,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run(process.env).then((result) => console.log(result));
}
