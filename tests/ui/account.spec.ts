import { test, expect } from '../../fixtures/pages';

// Opt in: tests in this file start logged in, using the state saved by tests/auth.setup.ts.
// Every other spec starts logged out, because most of the suite tests the login form itself.
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Logged-in user', () => {
  test('home page shows the Logout link', { tag: '@smoke' }, async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.header.logoutLink).toBeVisible();
  });
});
