import { afterAll, afterEach, beforeAll } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

const server = setupServer(...handlers);

beforeAll(() => {
  process.env.NOTION_API_KEY = "test-api-key";
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export { server };
