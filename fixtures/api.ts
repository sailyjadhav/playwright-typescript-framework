import { test as base } from '@playwright/test';

// The front door for API tests. It deliberately has no browser fixtures: fixtures/pages.ts has an
// automatic fixture that needs a browser context, which would start a browser for every API test.
export const test = base;

export { expect } from '@playwright/test';
