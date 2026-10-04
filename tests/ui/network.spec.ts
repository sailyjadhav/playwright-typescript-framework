import { test, expect } from '../../fixtures/pages';

// This site is mostly server-rendered, so there are few browser-side API calls to mock. These
// tests use network control where it fits: failing resources on purpose, and proving a form
// submission really reached the server.
test.describe('Network control', () => {
  test('product search still works when product images fail to load', async ({
    page,
    productsPage,
  }) => {
    // Abort every image request, as if the image server were down, and count the aborts so the
    // test proves the route really matched something.
    let abortedImages = 0;
    await page.route('**/*.{png,jpg,jpeg,gif,webp}', async (route) => {
      abortedImages++;
      await route.abort();
    });

    await productsPage.goto();
    await productsPage.search('Jeans');
    await expect(productsPage.searchedProductsHeading).toBeVisible();
    await expect(productsPage.resultNames.first()).toBeVisible();
    expect(abortedImages).toBeGreaterThan(0);
  });

  test('the login button sends the form to the server', async ({ page, loginPage }) => {
    await loginPage.goto();
    // Start listening before the click, so the response cannot arrive before we wait for it.
    const loginResponse = page.waitForResponse(
      (response) => response.url().endsWith('/login') && response.request().method() === 'POST',
    );
    await loginPage.login('nobody@example.com', 'secret123');

    // Non-retrying assertions are right here: the response has already arrived and is final.
    const response = await loginResponse;
    expect(response.status()).toBe(200);
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
