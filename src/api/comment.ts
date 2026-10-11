import { wrapError } from "@/utils/error";
import type { Client } from "@notionhq/client";
import type {
  CreateCommentParameters,
  CreateCommentResponse,
  DeleteCommentResponse,
  GetCommentResponse,
  ListCommentsParameters,
  ListCommentsResponse,
  UpdateCommentParameters,
  UpdateCommentResponse,
} from "@notionhq/client/build/src/api-endpoints.js";
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

export async function updateComment(params: UpdateCommentParameters, client?: Client): Promise<UpdateCommentResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    return await notionClient.comments.update(params);
  } catch (error) {
    throw wrapError(`Failed to update comment ${params.comment_id}`, error);
  }
}

export async function deleteComment(commentId: string, client?: Client): Promise<DeleteCommentResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    return await notionClient.comments.delete({ comment_id: commentId });
  } catch (error) {
    throw wrapError(`Failed to delete comment ${commentId}`, error);
  }
}
