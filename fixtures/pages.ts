import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';

// The fixture menu: every page object a test can ask for by name.
type PageFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
};

// Our own test: Playwright's test plus the page-object fixtures. Code before use() is setup,
// code after it is teardown; page objects need no teardown.
export const test = base.extend<PageFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
});

// Re-exported so every test imports test and expect from this one file.
export { expect } from '@playwright/test';
