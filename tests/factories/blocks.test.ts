import {
  buildBulletedListItemBlock,
  buildCalloutBlock,
  buildHeadingBlock,
  buildParagraphBlock,
  buildQuoteBlock,
  buildSyncedBlock,
  buildTemplateBlock,
  buildToDoBlock,
  buildToggleBlock,
} from "@/factories/blocks";
import { textToRichText } from "@/utils/richtext";
import type { AppendBlockChildrenParameters, BlockObjectRequest } from "@notionhq/client/build/src/api-endpoints";
import { describe, expect, it } from "vitest";

describe("block factories", () => {
  it("builds heading_4 blocks", () => {
    const block = buildHeadingBlock(4, textToRichText("Small heading"));

    expect(block).toEqual({
      type: "heading_4",
      heading_4: { rich_text: textToRichText("Small heading") },
    });
  });

  it("types heading blocks by level", () => {
    // A computed key used to widen the return type to an index signature, which the SDK rejected.
    const request: BlockObjectRequest = buildHeadingBlock(2, textToRichText("Section"), { is_toggleable: true });

    expect(request).toEqual({ type: "heading_2", heading_2: { rich_text: textToRichText("Section"), is_toggleable: true } });
  });

  it("accepts two levels of nested factory blocks without casts", () => {
    // These assignments are compile-time checks against the SDK request types.
    const children: AppendBlockChildrenParameters["children"] = [
      buildToggleBlock(textToRichText("Parent"), {
        children: [buildParagraphBlock(textToRichText("Child")), buildHeadingBlock(4, textToRichText("Child heading"))],
      }),
      buildCalloutBlock(textToRichText("Note"), {
        icon: { type: "emoji", emoji: "💡" },
        children: [buildBulletedListItemBlock(textToRichText("Item"), { children: [buildQuoteBlock(textToRichText("Grandchild"))] })],
      }),
      buildSyncedBlock([buildToDoBlock(textToRichText("Synced task"))]),
      buildTemplateBlock(textToRichText("Template"), [buildParagraphBlock(textToRichText("Template body"))]),
    ];

    expect(children).toHaveLength(4);
    expect(children[0]).toMatchObject({ type: "toggle", toggle: { children: [{ type: "paragraph" }, { type: "heading_4" }] } });
  });
});
