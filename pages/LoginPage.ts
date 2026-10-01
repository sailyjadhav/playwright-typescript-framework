import type { Locator, Page } from '@playwright/test';

// Login page: its locators and user actions. Assertions stay in the tests (pages act, tests check).
export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: 'Login to your account' });
    // getByTestId: the fields have no labels and the page has three "Email Address" boxes.
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByText('Your email or password is incorrect!');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
