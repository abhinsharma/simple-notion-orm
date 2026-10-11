import { buildParagraphBlock } from "@/factories/blocks";
import { textToRichText } from "@/utils/richtext";
import type { GetBlockResponse, DeleteBlockResponse, AppendBlockChildrenParameters } from "@notionhq/client/build/src/api-endpoints.js";
import { describe, it, expect } from "vitest";
import { captureNextRequest } from "../../../tests/request-capture";
import { getBlock, getBlockChildren, appendBlockChildren, updateBlock, deleteBlock, resolveAppendPosition } from "../block";
import { NOTION_API_VERSION } from "../client";

describe("getBlock", () => {
  it("should successfully retrieve a block by ID", async () => {
    const blockId = "obf_id_1";

    const result = await getBlock(blockId);

    expect(result.object).toBe("block");
    expect((result as GetBlockResponse & { type: string }).type).toBe("paragraph");
    expect(result.id).toBeDefined();
  });
});

describe("getBlockChildren", () => {
  it("should successfully retrieve children of a block", async () => {
    const blockId = "obf_id_2";

    const result = await getBlockChildren(blockId);

    expect(result.object).toBe("list");
    expect(result.results).toBeInstanceOf(Array);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.has_more).toBeDefined();
  });
});

describe("appendBlockChildren", () => {
  it("should successfully append children to a block", async () => {
    const blockId = "obf_id_2";
    const children = [buildParagraphBlock(textToRichText("New paragraph"))] as AppendBlockChildrenParameters["children"];

    const result = await appendBlockChildren(blockId, children);

    expect(result.object).toBe("list");
    expect(result.results).toBeInstanceOf(Array);
    expect(result.results.length).toBeGreaterThan(0);
  });

  it("sends the pinned API version and converts after into a position object", async () => {
    const blockId = "obf_id_2";
    const children = [buildParagraphBlock(textToRichText("After a block"))] as AppendBlockChildrenParameters["children"];
    const captured = captureNextRequest((request) => request.method === "PATCH" && request.url.endsWith(`/v1/blocks/${blockId}/children`));

    await appendBlockChildren(blockId, children, { after: "existing-block" });

    const { headers, body } = await captured;
    expect(headers.get("Notion-Version")).toBe(NOTION_API_VERSION);
    expect(body).toEqual(
      expect.objectContaining({
        position: { type: "after_block", after_block: { id: "existing-block" } },
      })
    );
    expect(body).not.toHaveProperty("after");
  });
});

describe("resolveAppendPosition", () => {
  it("prefers an explicit position over after", () => {
    expect(resolveAppendPosition({ after: "ignored", position: { type: "start" } })).toEqual({ type: "start" });
  });

  it("returns undefined when no position is given", () => {
    expect(resolveAppendPosition()).toBeUndefined();
    expect(resolveAppendPosition({})).toBeUndefined();
  });
});

describe("updateBlock", () => {
  it("should successfully update a block", async () => {
    const blockId = "obf_id_1";

    const result = await updateBlock({
      blockId,
      paragraph: {
        rich_text: textToRichText("Updated paragraph"),
      },
    });

    expect(result.object).toBe("block");
    expect((result as GetBlockResponse & { type: string }).type).toBe("paragraph");
    expect(result.id).toBeDefined();
  });
});

describe("deleteBlock", () => {
  it("should successfully delete a block", async () => {
    const blockId = "obf_id_1";

    const result = await deleteBlock(blockId);

    expect(result.object).toBe("block");
    expect((result as DeleteBlockResponse & { archived: boolean }).archived).toBe(true);
    expect(result.id).toBeDefined();
  });
});
