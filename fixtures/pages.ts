import { test as base, expect } from '@playwright/test';
import { accountForm, type TempUser } from '../data/temp-user';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import type { ApiMessageResponse } from '../utils/api-types';

// The fixture menu: every page object a test can ask for by name, plus a throwaway account.
type PageFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  tempUser: TempUser;
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
  // Creates an account through the API for one test and deletes it afterwards, even if the test
  // fails. The email is unique per run and browser, so parallel runs never use the same account.
  tempUser: async ({ request }, use, testInfo) => {
    const unique = `${Date.now()}-${testInfo.project.name}`;
    const user: TempUser = {
      name: 'Temp User',
      email: `temp.user.${unique}@example.com`,
      password: `Pw-${unique}`,
    };
    const created = await request.post('/api/createAccount', { form: accountForm(user) });
    expect(((await created.json()) as ApiMessageResponse).responseCode).toBe(201);

    await use(user);

    const deleted = await request.delete('/api/deleteAccount', {
      form: { email: user.email, password: user.password },
    });
    expect(((await deleted.json()) as ApiMessageResponse).responseCode).toBe(200);
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
