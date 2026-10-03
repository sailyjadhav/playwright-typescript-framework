import { test, expect } from '../../fixtures/pages';
import { termWithNoResults, termsMatchingProductNames } from '../../data/search-terms';

test.describe('Product search', () => {
  for (const term of termsMatchingProductNames) {
    test(`every result for "${term}" contains the term`, async ({ productsPage }) => {
      await productsPage.goto();
      await productsPage.search(term);
      // Hard assertions: the checks below only make sense once results are on the page.
      await expect(productsPage.searchedProductsHeading).toBeVisible();
      await expect(productsPage.resultNames.first()).toBeVisible();

      // Soft assertions: each name is an independent check, so one bad result does not hide others.
      for (const name of await productsPage.resultNames.all()) {
        await expect.soft(name).toContainText(term, { ignoreCase: true });
      }
    });
  }

  test('a term with no matching product returns no results', async ({ productsPage }) => {
    await productsPage.goto();
    await productsPage.search(termWithNoResults);
    await expect(productsPage.searchedProductsHeading).toBeVisible();
    await expect(productsPage.resultNames).toHaveCount(0);
  });
});
