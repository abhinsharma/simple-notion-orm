module.exports = {
  rules: {
    "import/default": "off",
    "import/export": "off",
    "import/namespace": "off",
    "import/no-unresolved": "off",
    "import/no-mutable-exports": "error",
    "import/first": "error",
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: ["tests/**", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "vitest.config.ts", "playground/**"],
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
    "import/no-self-import": "error",
    "import/no-default-export": "error",
    "import/no-absolute-path": "error",
    "import/order": [
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
