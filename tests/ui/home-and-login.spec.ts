import { test, expect } from '@playwright/test';

// Session 3: first UI tests, one describe group with three independent tests.
// data-qa is set as the test ID attribute in playwright.config.ts (use.testIdAttribute).

test.describe('Home and login', () => {
  // Test 1: home page - title plus the static "Features Items" heading (the carousel h1 is flaky).
  test('home page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Automation Exercise');
    await expect(page.getByRole('heading', { name: 'Features Items' })).toBeVisible();
  });

  // Test 2: the Signup / Login menu link opens the login form.
  test('signup / login link opens the login form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Signup / Login' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Login to your account' })).toBeVisible();
  });

  // Test 3: wrong email and password show the error message (opens /login directly, so it
  // does not depend on the menu link that test 2 checks).
  test('invalid credentials show an error message', async ({ page }) => {
    await page.goto('/login');
    // getByTestId: the fields have no labels and the page has three "Email Address" boxes.
    await page.getByTestId('login-email').fill('invalid@example.com');
    await page.getByTestId('login-password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Your email or password is incorrect!')).toBeVisible();
  });
});
