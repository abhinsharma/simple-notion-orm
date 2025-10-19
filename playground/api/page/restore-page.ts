import "dotenv/config";
import { restorePage } from "@/api/page";

const pageId = process.argv[2]!;
const page = await restorePage(pageId);
console.dir({ id: page.id, archived: page.archived });
