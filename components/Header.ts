import type { Locator, Page } from '@playwright/test';

// The top menu shown on every page. Pages include it as a part (composition) instead of
// inheriting it from a base page.
export class Header {
  readonly signupLoginLink: Locator;
  // Shown only when a user is logged in, so it doubles as the "logged in" check.
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.signupLoginLink = page.getByRole('link', { name: 'Signup / Login' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async openSignupLogin() {
    await this.signupLoginLink.click();
  }
}
