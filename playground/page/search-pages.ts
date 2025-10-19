import "dotenv/config";
import { searchPages } from "@api/page";

async function main(): Promise<void> {
  const query = process.argv[2] ?? "";

  const results = await searchPages(query);

  console.dir(
    {
      query,
      count: results.results.length,
      ids: results.results.map((item) => ("id" in item ? item.id : undefined)),
    },
    { depth: 2 }
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
