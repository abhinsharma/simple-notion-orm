import "dotenv/config";
import { getPage } from "@/api/page";

const pageId = process.env.CAPTURE_PAGE_ID!;
const page = await getPage(pageId);
console.dir(page);
