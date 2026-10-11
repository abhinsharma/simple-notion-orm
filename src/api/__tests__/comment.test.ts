import { NotionBlocks } from "@/pages/notion-blocks";
import { describe, it, expect } from "vitest";
import { captureNextRequest } from "../../../tests/request-capture";
import { listComments, createComment, deleteComment, getComment, updateComment } from "../comment";

describe("listComments", () => {
  it("should list comments for a page", async () => {
    const result = await listComments({ block_id: "page-1" });

    expect(result.object).toBe("list");
    expect(result.results).toBeInstanceOf(Array);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0].object).toBe("comment");
  });
});

describe("createComment", () => {
  it("should create a page comment", async () => {
    const result = await createComment({
      parent: { page_id: "page-1" },
      rich_text: [{ type: "text", text: { content: "New comment" } }],
    });

    expect(result.object).toBe("comment");
    expect(result.id).toBeDefined();
  });

  it("should create a discussion reply", async () => {
    const result = await createComment({
      discussion_id: "discussion-1",
      rich_text: [{ type: "text", text: { content: "Reply" } }],
    });

    expect(result.object).toBe("comment");
    expect(result.id).toBeDefined();
  });
});

describe("getComment", () => {
  it("should retrieve a comment by ID", async () => {
    const result = await getComment("comment-1");

    expect(result.object).toBe("comment");
    expect(result.id).toBe("comment-1");
  });
});

describe("NotionBlocks.replyToComment", () => {
  it("should reply to a discussion", async () => {
    const blocks = NotionBlocks.forPage("page-1");
    const result = await blocks.replyToComment("discussion-1", "Reply from blocks");

    expect(result.object).toBe("comment");
    expect(result.id).toBeDefined();
  });
});

describe("updateComment", () => {
  it("sends the new markdown body", async () => {
    const captured = captureNextRequest((request) => request.method === "PATCH" && request.url.includes("/v1/comments/"));

    const result = await updateComment({ comment_id: "comment-1", markdown: "Edited **comment**" });

    const { url, body } = await captured;
    expect(url).toContain("/v1/comments/comment-1");
    expect(body).toEqual({ markdown: "Edited **comment**" });
    expect(result.object).toBe("comment");
  });
});

describe("deleteComment", () => {
  it("deletes a comment by ID", async () => {
    const captured = captureNextRequest((request) => request.method === "DELETE" && request.url.includes("/v1/comments/"));

    const result = await deleteComment("comment-1");

    const { url } = await captured;
    expect(url).toContain("/v1/comments/comment-1");
    expect(result.object).toBe("comment");
  });
});
