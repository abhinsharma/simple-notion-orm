import "dotenv/config";
import { getPage } from "@/api/page";

async function main(): Promise<void> {
  const pageId = process.env.CAPTURE_PAGE_ID;

  if (!pageId) {
    throw new Error(
      "CAPTURE_PAGE_ID is not set. Please define it in your environment (.env.local) before running the playground."
    );
  }

  const page = await getPage(pageId);

  console.dir(page);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
