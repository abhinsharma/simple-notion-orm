import { getPage } from "@/api/page";
import "dotenv/config";

async function main(): Promise<void> {
  const pageId = process.env.CAPTURE_PAGE_ID!;
  const page = await getPage(pageId);
  console.dir(page);
}

main();
