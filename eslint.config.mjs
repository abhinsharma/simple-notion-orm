import path from 'node:path';
import { fileURLToPath } from 'node:url';

import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import unicornPlugin from 'eslint-plugin-unicorn';
import { createRequire } from 'node:module';

import bestPractices from './lint-rules/best-practices.js';
import comments from './lint-rules/comments.js';
import imports from './lint-rules/imports.js';
import naming from './lint-rules/naming.js';
import typescriptRules from './lint-rules/typescript.js';

const require = createRequire(import.meta.url);
const importPlugin = require('./lint-rules/plugins/import.cjs');
const eslintCommentsPlugin = require('./lint-rules/plugins/eslint-comments.cjs');

export default [
  {
    ignores: ['dist/**', 'node_modules/**', 'playground/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        projectService: true,
        tsconfigRootDir: path.dirname(fileURLToPath(import.meta.url)),
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      'eslint-comments': eslintCommentsPlugin,
      unicorn: unicornPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      ...bestPractices.rules,
      ...comments.rules,
      ...imports.rules,
      ...naming.rules,
      ...typescriptRules.rules,
      'no-duplicate-imports': 'error',
    },
  },
  {
    files: [
      'tests/**/*.ts',
      'tests/**/*.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
    ],
    languageOptions: {
      globals: {
        afterAll: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        test: 'readonly',
        vi: 'readonly',
      },
    },
  },
];
