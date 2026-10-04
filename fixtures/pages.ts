import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';

// The fixture menu: every page object a test can ask for by name.
type PageFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

// Fixtures that run for every test without being asked for. They give the test nothing (void).
type AutoFixtures = {
  blockThirdPartyRequests: void;
};

// Our own test: Playwright's test plus the page-object fixtures. Code before use() is setup,
// code after it is teardown; page objects need no teardown.
export const test = base.extend<PageFixtures & AutoFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  // Abort every request to a host other than the site under test (ads, trackers, fonts).
  // Third-party ads sometimes never finish loading, which made page.goto time out.
  blockThirdPartyRequests: [
    async ({ context, baseURL }, use) => {
      const siteHost = new URL('/', baseURL).hostname;
      await context.route(
        (url) => url.hostname !== siteHost,
        (route) => route.abort(),
      );
      await use();
    },
    { auto: true },
  ],
});

// Re-exported so every test imports test and expect from this one file.
export { expect } from '@playwright/test';
