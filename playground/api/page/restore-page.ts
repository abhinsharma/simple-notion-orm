import "dotenv/config";
import { restorePage } from "@/api/page";

async function main(): Promise<void> {
  const pageId = process.argv[2];

  if (!pageId) {
    throw new Error(
      "Pass the page ID you want to restore as the first argument. Example: pnpm tsx playground/restore-page.ts <PAGE_ID>"
    );
  }

  await restorePage(pageId);

  console.log(`Restored page ${pageId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
