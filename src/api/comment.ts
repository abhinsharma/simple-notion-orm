import { wrapError } from "@/utils/error";
import type { Client } from "@notionhq/client";
import type {
  CreateCommentParameters,
  CreateCommentResponse,
  GetCommentResponse,
  ListCommentsParameters,
  ListCommentsResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { getNotionClient } from "./client";

export async function listComments(params: ListCommentsParameters, client?: Client): Promise<ListCommentsResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    return await notionClient.comments.list(params);
  } catch (error) {
    throw wrapError(`Failed to list comments for block ${params.block_id}`, error);
  }
}

export async function createComment(params: CreateCommentParameters, client?: Client): Promise<CreateCommentResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    return await notionClient.comments.create(params);
  } catch (error) {
    throw wrapError("Failed to create comment", error);
  }
}

export async function getComment(commentId: string, client?: Client): Promise<GetCommentResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    return await notionClient.comments.retrieve({ comment_id: commentId });
  } catch (error) {
    throw wrapError(`Failed to retrieve comment ${commentId}`, error);
  }
}
