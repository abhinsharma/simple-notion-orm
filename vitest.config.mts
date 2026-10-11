import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
    setupFiles: ["tests/setup-msw.ts"],
    environment: "node",
    passWithNoTests: true,
  },
  resolve: {
    alias: {
      "simple-notion-orm": path.resolve(root, "src/index.ts"),
      "@/orm": path.resolve(root, "src/orm"),
      "@/api": path.resolve(root, "src/api"),
      "@/utils": path.resolve(root, "src/utils"),
      "@/types": path.resolve(root, "src/types"),
      "@/constants": path.resolve(root, "src/constants"),
      "@/factories": path.resolve(root, "src/factories"),
      "@/pages": path.resolve(root, "src/pages"),
      "@/transform": path.resolve(root, "src/transform"),
    },
  },
});
