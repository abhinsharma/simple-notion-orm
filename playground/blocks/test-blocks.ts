import "dotenv/config";

import { appendBlockChildren } from "@api/block";
import { getPage } from "@api/page";
import {
  buildAudioBlock,
  buildBookmarkBlock,
  buildBreadcrumbBlock,
  buildCalloutBlock,
  buildCodeBlock,
  buildColumnBlock,
  buildColumnListBlock,
  buildDividerBlock,
  buildEmbedBlock,
  buildEquationBlock,
  buildFileBlock,
  buildHeadingBlock,
  buildImageBlock,
  buildLinkToPageBlock,
  buildNumberedListItemBlock,
  buildParagraphBlock,
  buildPdfBlock,
  buildTableBlock,
  buildTableOfContentsBlock,
  buildTableRowBlock,
  buildTemplateBlock,
  buildToDoBlock,
  buildToggleBlock,
  buildVideoBlock,
  buildBulletedListItemBlock,
  buildQuoteBlock,
} from "@factories/blocks";
import { textToRichText, createRichTextItem } from "@utils/richtext";

type TestCase = {
  name: string;
  build: () => Record<string, unknown>;
};

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function buildTestCases(pageId: string, timestamp: string): TestCase[] {
  const textCases: TestCase[] = [
    {
      name: "heading_1",
      build: () => buildHeadingBlock(1, textToRichText(`Heading 1 (${timestamp})`)),
    },
    {
      name: "heading_2",
      build: () => buildHeadingBlock(2, textToRichText(`Heading 2 (${timestamp})`)),
    },
    {
      name: "heading_3",
      build: () => buildHeadingBlock(3, textToRichText(`Heading 3 (${timestamp})`)),
    },
    {
      name: "paragraph",
      build: () => buildParagraphBlock(textToRichText(`Paragraph (${timestamp})`)),
    },
    {
      name: "bulleted_list_item",
      build: () => buildBulletedListItemBlock(textToRichText(`Bullet (${timestamp})`)),
    },
    {
      name: "numbered_list_item",
      build: () => buildNumberedListItemBlock(textToRichText(`Numbered item (${timestamp})`)),
    },
    {
      name: "to_do",
      build: () => buildToDoBlock(textToRichText(`Todo (${timestamp})`), { checked: false }),
    },
    {
      name: "toggle",
      build: () => buildToggleBlock(textToRichText(`Toggle (${timestamp})`)),
    },
    {
      name: "quote",
      build: () => buildQuoteBlock(textToRichText(`Quote (${timestamp})`)),
    },
  ];

  const mediaCases: TestCase[] = [
    {
      name: "image",
      build: () =>
        buildImageBlock(
          { type: "external", url: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d" },
          textToRichText("Image caption")
        ),
    },
    {
      name: "video",
      build: () =>
        buildVideoBlock(
          { type: "external", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
          textToRichText("Video caption")
        ),
    },
    {
      name: "bookmark",
      build: () => buildBookmarkBlock("https://www.notion.so", textToRichText("Bookmark caption")),
    },
    {
      name: "embed",
      build: () => buildEmbedBlock("https://codesandbox.io", textToRichText("Embed caption")),
    },
    {
      name: "pdf",
      build: () =>
        buildPdfBlock(
          { type: "external", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf" },
          textToRichText("PDF caption")
        ),
    },
    {
      name: "file",
      build: () =>
        buildFileBlock(
          { type: "external", url: "https://filesamples.com/samples/document/txt/sample1.txt" },
          "Sample file",
          textToRichText("File caption")
        ),
    },
    {
      name: "audio",
      build: () =>
        buildAudioBlock(
          { type: "external", url: "https://samplelib.com/lib/preview/mp3/sample-3s.mp3" },
          textToRichText("Audio caption")
        ),
    },
  ];

  const layoutCases: TestCase[] = [
    { name: "divider", build: () => buildDividerBlock() },
    { name: "breadcrumb", build: () => buildBreadcrumbBlock() },
    { name: "table_of_contents", build: () => buildTableOfContentsBlock() },
    {
      name: "table",
      build: () => {
        const headerRow = buildTableRowBlock([
          [createRichTextItem("Header A")],
          [createRichTextItem("Header B")],
        ]);
        const dataRow = buildTableRowBlock([
          [createRichTextItem("Cell A1")],
          [createRichTextItem("Cell B1")],
        ]);
        return buildTableBlock([headerRow, dataRow], {
          has_column_header: true,
          table_width: 2,
        });
      },
    },
    {
      name: "column_list",
      build: () => {
        const leftColumn = buildColumnBlock([buildParagraphBlock(textToRichText("Left column paragraph"))]);
        const rightColumn = buildColumnBlock([buildParagraphBlock(textToRichText("Right column paragraph"))]);
        return buildColumnListBlock([leftColumn, rightColumn]);
      },
    },
  ];

  const advancedCases: TestCase[] = [
    {
      name: "code",
      build: () => buildCodeBlock(textToRichText(`console.log("Hello ${timestamp}")`), "javascript"),
    },
    {
      name: "callout",
      build: () =>
        buildCalloutBlock(textToRichText("Callout content"), {
          icon: { type: "emoji", emoji: "💡" },
          color: "yellow_background",
        }),
    },
    {
      name: "equation",
      build: () => buildEquationBlock("E = mc^2"),
    },
    {
      name: "link_to_page",
      build: () => buildLinkToPageBlock({ type: "page_id", page_id: pageId }),
    },
    {
      name: "template",
      build: () => buildTemplateBlock(textToRichText("Template starter")),
    },
  ];

  return [...textCases, ...mediaCases, ...layoutCases, ...advancedCases];
}

async function runBatch(
  pageId: string,
  batchIndex: number,
  cases: TestCase[]
): Promise<void> {
  const blocks = cases.map((testCase) => testCase.build());

  try {
    const response = await appendBlockChildren(pageId, blocks);
    console.log(
      `Batch ${batchIndex}: appended ${response.results.length} blocks (${cases
        .map((test) => test.name)
        .join(", ")})`
    );
  } catch (error) {
    console.error(
      `Batch ${batchIndex} failed (${cases.map((test) => test.name).join(", ")}):`,
      error
    );

    for (const testCase of cases) {
      try {
        const singleResponse = await appendBlockChildren(pageId, [testCase.build()]);
        console.log(
          `  ↳ ${testCase.name}: appended ${singleResponse.results.length} block`
        );
      } catch (singleError) {
        console.error(`  ↳ ${testCase.name}: failed`, singleError);
      }
    }
  }
}

async function main(): Promise<void> {
  const pageId = process.env.CAPTURE_PAGE_ID;

  if (!pageId) {
    throw new Error(
      "CAPTURE_PAGE_ID is not set. Define it in your environment before running the block playground."
    );
  }

  const timestamp = new Date().toISOString();
  const testCases = buildTestCases(pageId, timestamp);
  const batches = chunk(testCases, 4);

  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    await runBatch(pageId, index + 1, batch);
  }

  const page = await getPage(pageId);
  const titleProperty = (page as Record<string, any>).properties?.title;
  const title =
    titleProperty?.type === "title"
      ? titleProperty.title.map((item: { plain_text: string }) => item.plain_text).join("") ||
        "(empty title)"
      : "(title property unavailable)";

  console.log(`Verified getPage at end: "${title}" (ID: ${pageId}).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
