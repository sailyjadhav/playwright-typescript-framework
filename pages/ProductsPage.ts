import type { Locator, Page } from '@playwright/test';

// Products page: its locators and user actions. Assertions stay in the tests.
export class ProductsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchedProductsHeading: Locator;
  readonly resultNames: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('textbox', { name: 'Search Product' });
    // Exception: the search button is an icon with no text or label, so it has no accessible
    // name and getByRole cannot find it. Its id is the only stable hook.
    this.searchButton = page.locator('#submit_search');
    this.searchedProductsHeading = page.getByRole('heading', { name: 'Searched Products' });
    // Exception: product cards have no roles or test IDs, and each name also repeats in a hover
    // overlay, so the name inside .productinfo is the one reliable copy.
    this.resultNames = page.locator('.productinfo p');
  }

  async goto() {
    await this.page.goto('/products');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchButton.click();
  }
}
