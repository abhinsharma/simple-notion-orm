import { buildParagraphBlock } from "@/factories/blocks";
import { textToRichText } from "@/utils/richtext";
import type { GetBlockResponse, DeleteBlockResponse, AppendBlockChildrenParameters, UpdateBlockParameters } from "@notionhq/client/build/src/api-endpoints";
import { describe, it, expect } from "vitest";
import { getBlock, getBlockChildren, appendBlockChildren, updateBlock, deleteBlock } from "../block";

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
});

describe("updateBlock", () => {
  it("should successfully update a block", async () => {
    const blockId = "obf_id_1";

    const result = await updateBlock({
      blockId,
      paragraph: {
        rich_text: textToRichText("Updated paragraph"),
      },
    } as { blockId: string } & Omit<UpdateBlockParameters, "block_id">);

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
