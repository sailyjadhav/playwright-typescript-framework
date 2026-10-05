import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Load values from .env into process.env (quiet: true hides dotenv's log line).
dotenv.config({ quiet: true });

// Fail fast: stop the run if BASE_URL is missing, instead of testing the wrong site.
const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error('BASE_URL is missing. Please set it in your .env file (see .env.example).');
}

export default defineConfig({
  // Where tests live; a test may take 30 s, and an assertion keeps retrying for up to 5 s.
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Retry and forbid test.only on CI only; locally we want to see failures straight away.
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  // One worker on CI for stability (to be tuned in Session 10).
  workers: process.env.CI ? 1 : undefined,

  // HTML report for detail, list for live progress in the terminal.
  reporter: [['html'], ['list']],

  use: {
    // Tests call page.goto('/path'); the site is chosen by BASE_URL in .env.
    baseURL,
    // Evidence on failure: trace when a test is retried, screenshot and video only when it fails.
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    testIdAttribute: 'data-qa', // The site has no form labels; its data-qa attributes are the stable way to find inputs.
  },

  // setup logs in once and saves the state; UI tests run once per browser engine after it.
  // API tests need no browser, so they run once, in their own project, and the browser
  // projects skip them.
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    { name: 'api', testMatch: /tests\/api\/.*\.spec\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /tests\/api\//,
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
      testIgnore: /tests\/api\//,
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
      testIgnore: /tests\/api\//,
    },
  ],
});
