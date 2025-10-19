import "dotenv/config";
import { createPage } from "../src/api/page";

async function main(): Promise<void> {
  const parentId = process.env.CAPTURE_PAGE_ID;
  if (!parentId) {
    throw new Error("CAPTURE_PAGE_ID is not set. Provide a parent page ID to create a child page.");
  }

  const result = await createPage({
    parentId,
    properties: {
      title: [
        {
          type: "text",
          text: { content: `Playground create ${new Date().toISOString()}` },
        },
      ],
    },
  });

  console.dir(
    {
      createdId: result.id,
      url: result.url,
    },
    { depth: 2 }
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
