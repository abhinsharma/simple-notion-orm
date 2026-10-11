/**
 * User API
 * Wrappers for listing and retrieving workspace users
 */
import { wrapError } from "@/utils/error";
import { iteratePaginatedAPI, type Client } from "@notionhq/client";
import type { GetSelfResponse, GetUserResponse, ListUsersResponse } from "@notionhq/client/build/src/api-endpoints";
import { getNotionClient } from "./client";

type UserObject = ListUsersResponse["results"][number];

/**
 * Retrieve a user by ID
 */
export async function getUser(userId: string, client?: Client): Promise<GetUserResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    return await notionClient.users.retrieve({ user_id: userId });
  } catch (error) {
    throw wrapError(`Failed to retrieve user ${userId}`, error);
  }
}

/**
 * Retrieve the bot user that owns the current token
 */
export async function getSelf(client?: Client): Promise<GetSelfResponse> {
  try {
    const notionClient = client ?? getNotionClient();
    return await notionClient.users.me({});
  } catch (error) {
    throw wrapError("Failed to retrieve the bot user", error);
  }
}

/**
 * List every user in the workspace, following pagination cursors
 */
export async function listUsers(client?: Client): Promise<UserObject[]> {
  try {
    const notionClient = client ?? getNotionClient();
    const users: UserObject[] = [];
    for await (const user of iteratePaginatedAPI(notionClient.users.list, {})) {
      users.push(user);
    }
    return users;
  } catch (error) {
    throw wrapError("Failed to list users", error);
  }
}
