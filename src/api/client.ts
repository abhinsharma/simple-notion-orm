import { Client } from "@notionhq/client";
import dotenv from "dotenv";

export type NotionClientOptions = {
  auth: string;
};

export function createNotionClient(options: NotionClientOptions): Client {
  return new Client({ auth: options.auth, notionVersion: "2026-03-11" });
}

let client: Client | null = null;
let envLoaded = false;

function ensureEnvironment(): void {
  if (!envLoaded) {
    dotenv.config({ quiet: true });
    envLoaded = true;
  }
}

export function getNotionClient(): Client {
  if (client) {
    return client;
  }

  ensureEnvironment();

  const notionApiKey = process.env.NOTION_API_KEY;

  if (!notionApiKey) {
    throw new Error('NOTION_API_KEY is not set in the environment variables. Please ensure you have a .env file with NOTION_API_KEY="your_key_here"');
  }

  client = new Client({
    auth: notionApiKey,
    notionVersion: "2026-03-11",
  });

  return client;
}
