import { defineConfig } from "vitepress";
import { resolve } from "node:path";

export default defineConfig({
  title: "Simple Notion ORM",
  description: "Schema-first toolkit for Notion's API",
  srcDir: "./",
  outDir: resolve(__dirname, "../../dist/docs-site"),
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "ORM", link: "/orm/basics" },
      { text: "API", link: "/api/page" },
      { text: "Factories", link: "/factories/blocks" }
    ],
    sidebar: {
      "/orm/": [
        { text: "Overview", link: "/orm/" },
        { text: "Basics", link: "/orm/basics" },
        { text: "Column Builders", link: "/orm/column-builders" },
        { text: "Relations", link: "/orm/relations" }
      ],
      "/api/": [
        { text: "Pages", link: "/api/page" },
        { text: "Blocks", link: "/api/block" },
        { text: "Databases", link: "/api/database" },
        { text: "Database Pages", link: "/api/database-page" }
      ],
      "/factories/": [
        { text: "Blocks", link: "/factories/blocks" },
        { text: "Properties", link: "/factories/properties" }
      ]
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/abhinsharma/simple-notion-orm" }
    ],
    editLink: {
      pattern: "https://github.com/abhinsharma/simple-notion-orm/edit/docs-site/docs/:path",
      text: "Edit this page on GitHub"
    },
    footer: {
      message: "Released under the ISC License.",
      copyright: "© " + new Date().getFullYear() + " Simple Notion ORM"
    }
  }
});
