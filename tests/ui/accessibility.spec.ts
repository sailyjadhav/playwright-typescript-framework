import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../fixtures/pages';

// WCAG 2 level A and AA rules, the usual legal and industry target.
const wcagRules = ['wcag2a', 'wcag2aa'];

// Known issues on the demo site, which we cannot fix. The baseline test fails only if a new kind
// of violation appears, so these stay visible instead of making the test red forever.
const knownProductsPageViolations = [
  'button-name', // the search and newsletter buttons are icons with no accessible name
  'color-contrast', // grey-on-white text across the product listing
];

test.describe('Accessibility', () => {
  test('the login form has no WCAG A or AA violations', async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();

    // Exception: axe scopes by CSS selector; .login-form is the form the suite tests most.
    const results = await new AxeBuilder({ page })
      .withTags(wcagRules)
      .include('.login-form')
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test('the products page has no new kinds of WCAG A or AA violation', async ({
    page,
    productsPage,
  }) => {
    await productsPage.goto();
    await expect(productsPage.searchInput).toBeVisible();

    const results = await new AxeBuilder({ page }).withTags(wcagRules).analyze();
    const newKinds = results.violations
      .map((violation) => violation.id)
      .filter((id) => !knownProductsPageViolations.includes(id));
    expect(newKinds).toEqual([]);
  });
});
