import { defineConfig, globalIgnores } from 'eslint/config';
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import prettierConfig from 'eslint-config-prettier/flat';

export default defineConfig([
  globalIgnores(['playwright-report/', 'test-results/']),

  js.configs.recommended,

  // Type-aware rules (e.g. no-floating-promises) need type info, so they read tsconfig.json.
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },

  // This file is not in tsconfig.json's "include", so skip type-aware rules for plain JS files.
  {
    files: ['**/*.mjs'],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    files: ['tests/**'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // The plugin only warns; CLAUDE.md forbids hard waits, so block them.
      'playwright/no-wait-for-timeout': 'error',
    },
  },

  // Must stay last: turns off ESLint formatting rules so they don't fight Prettier.
  prettierConfig,
]);
