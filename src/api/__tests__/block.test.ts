import { buildParagraphBlock } from "@/factories/blocks";
import { textToRichText } from "@/utils/richtext";
import { describe, it, expect } from "vitest";
import { getBlock, getBlockChildren, appendBlockChildren, updateBlock, deleteBlock } from "../block";

describe("getBlock", () => {
  it("should successfully retrieve a block by ID", async () => {
    const blockId = "obf_id_1";

    const result = await getBlock(blockId);

    expect(result.object).toBe("block");
    expect((result as any).type).toBe("paragraph");
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
    const children = [buildParagraphBlock(textToRichText("New paragraph"))] as any;

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
    } as any);

    expect(result.object).toBe("block");
    expect((result as any).type).toBe("paragraph");
    expect(result.id).toBeDefined();
  });
});

describe("deleteBlock", () => {
  it("should successfully delete a block", async () => {
    const blockId = "obf_id_1";

    const result = await deleteBlock(blockId);

    expect(result.object).toBe("block");
    expect((result as any).archived).toBe(true);
    expect(result.id).toBeDefined();
  });
});
