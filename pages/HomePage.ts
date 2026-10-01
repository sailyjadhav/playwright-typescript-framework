import type { Locator, Page } from '@playwright/test';
import { Header } from '../components/Header';

// Home page: its locators and user actions. Assertions stay in the tests.
export class HomePage {
  readonly page: Page;
  readonly header: Header;
  readonly featuresHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new Header(page);
    // "Features Items" sits outside the sliding carousel; the carousel heading is flaky
    // because two copies are visible during a slide change.
    this.featuresHeading = page.getByRole('heading', { name: 'Features Items' });
  }

  async goto() {
    await this.page.goto('/');
  }
}
