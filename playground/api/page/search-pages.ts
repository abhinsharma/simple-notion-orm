import { searchPages } from "@/api/page";
import "dotenv/config";

async function main(): Promise<void> {
  const query = process.argv[2] ?? "";
  const results = await searchPages(query);
  console.dir({
    query,
    count: results.results.length,
    ids: results.results.map((item) => ("id" in item ? item.id : undefined)),
  });
}

main();
