import "dotenv/config";
import { archivePage } from "@/api/page";

const pageId = process.argv[2]!;
const page = await archivePage(pageId);
console.dir({ id: page.id, archived: page.archived });
