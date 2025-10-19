import "dotenv/config";
import { archivePage } from "../src/api/page";

async function main(): Promise<void> {
  const pageId = process.argv[2];

  if (!pageId) {
    throw new Error(
      "Pass the page ID you want to archive as the first argument. Example: pnpm tsx playground/archive-page.ts <PAGE_ID>"
    );
  }

  await archivePage(pageId);

  console.log(`Archived page ${pageId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
