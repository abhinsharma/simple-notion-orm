import { archivePage } from "@/api/page";
import "dotenv/config";

async function main(): Promise<void> {
  const pageId = process.argv[2]!;
  const page = await archivePage(pageId);
  console.dir({ id: page.id, archived: page.archived });
}

main();
