// Runs once, as the "setup" project, before the browser projects: logs in the test user and
// saves the browser state so logged-in tests can start already logged in.
import { test as setup } from '../fixtures/pages';
import { expect } from '@playwright/test';

// Where the saved login (cookies) goes. This folder is git-ignored: the file is a live session.
const authFile = 'playwright/.auth/user.json';

// Fail fast here, outside the test, so a missing credential stops the run with a clear message.

const email = process.env.TEST_USER_EMAIL;
const password = process.env.TEST_USER_PASSWORD;

if (!email || !password) {
  throw new Error(
    'TEST_USER_EMAIL or TEST_USER_PASSWORD is missing: set them in .env locally (see .env.example), or as repository secrets in CI.',
  );
}

setup('authenticate', async ({ loginPage, homePage }) => {
  await loginPage.goto();
  await loginPage.login(email, password);
  // Verify the login worked before saving, so a failed login is never saved as a session.
  await expect(homePage.header.logoutLink).toBeVisible();

  await loginPage.page.context().storageState({ path: authFile });
});
