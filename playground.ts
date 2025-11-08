/**
 * Notes: status columns must be provisioned manually before using builders. Always reset the
 * playground after experiments and keep sandbox data clean.
 * Use a dedicated sandbox page/database, and reset this file after experiments.
 */
import "dotenv/config";

const log = (message: string) => process.stdout.write(`${message}\n`);
const logError = (message: string) => process.stderr.write(`${message}\n`);

async function main() {
  const parentId = process.env.PLAYGROUND_PAGE_ID;

  if (!parentId) {
    logError("Set PLAYGROUND_PAGE_ID in your .env file to run playground flows.");
    return;
  }

  log(`Playground ready to run against parent page: ${parentId}`);
}

main().catch((error) => {
  logError(`Playground failed: ${(error as Error).message}`);
  process.exit(1);
});
