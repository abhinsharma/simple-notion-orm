export default {
  rules: {
    "@typescript-eslint/no-redundant-type-constituents": "error",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/require-array-sort-compare": ["error", { ignoreStringArrays: true }],
    "@typescript-eslint/naming-convention": [
      "error",
      {
        selector: "variable",
        format: ["camelCase", "UPPER_CASE", "PascalCase"],
        leadingUnderscore: "allow",
        filter: {
          match: false,
          regex: "^(.*)(Context|Provider|Schema|Styled|Styles)$",
        },
      },
      {
        selector: "variable",
        format: ["PascalCase"],
        types: ["boolean"],
        prefix: ["is", "should", "has", "can", "did", "will"],
      },
      {
        selector: ["typeAlias", "interface"],
        custom: {
          match: false,
          regex: "^I[A-Z]|^(Interface|Props|State)$",
        },
        format: ["PascalCase"],
      },
      {
        selector: "function",
        format: ["strictCamelCase", "PascalCase"],
        filter: {
          match: false,
          regex: "^_(.*)",
        },
      },
      {
        selector: "variable",
        format: ["strictCamelCase", "PascalCase"],
        types: ["function"],
      },
      {
        selector: "enum",
        format: ["UPPER_CASE", "PascalCase"],
      },
      {
        selector: "enumMember",
        format: ["strictCamelCase", "UPPER_CASE", "PascalCase"],
      },
    ],
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
      },
    ],
  },
};
