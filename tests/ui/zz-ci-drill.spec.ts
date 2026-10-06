import { test, expect } from '../../fixtures/pages';

// CI break drill: fails on purpose to show a red check on the pull request. Removed afterwards.
test('CI drill: home page title is wrong on purpose', async ({ homePage, page }) => {
  await homePage.goto();
  await expect(page).toHaveTitle('This Is Not The Title');
});
