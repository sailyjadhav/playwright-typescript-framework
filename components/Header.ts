import type { Locator, Page } from '@playwright/test';

// The top menu shown on every page. Pages include it as a part (composition) instead of
// inheriting it from a base page.
export class Header {
  readonly signupLoginLink: Locator;

  constructor(page: Page) {
    this.signupLoginLink = page.getByRole('link', { name: 'Signup / Login' });
  }

  async openSignupLogin() {
    await this.signupLoginLink.click();
  }
}
