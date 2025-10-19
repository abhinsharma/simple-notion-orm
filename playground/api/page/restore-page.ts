import { restorePage } from "@/api/page";
import "dotenv/config";

async function main(): Promise<void> {
  const pageId = process.argv[2]!;
  const page = await restorePage(pageId);
  console.dir({ id: page.id, archived: page.archived });
}

main();
