export default {
  rules: {
    "import-x/default": "off",
    "import-x/export": "off",
    "import-x/namespace": "off",
    "import-x/no-unresolved": "off",
    "import-x/no-mutable-exports": "error",
    "import-x/first": "error",
    "import-x/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["tests/**", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "vitest.config.ts", "playground/**"],
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    "import-x/no-self-import": "error",
    "import-x/no-default-export": "error",
    "import-x/no-absolute-path": "error",
    "import-x/order": [
      "error",
      {
        groups: ["internal", "builtin", "external", "parent", "sibling", "index"],
        pathGroups: [
          {
            pattern: "@/**",
            group: "internal",
          },
        ],
        "newlines-between": "never",
      },
    ],
  },
};
