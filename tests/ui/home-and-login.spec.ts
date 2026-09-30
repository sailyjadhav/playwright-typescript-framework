import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';

// Session 3: first UI tests, one describe group with three independent tests.
// Session 4: locators live in page objects (pages/, components/); tests only act and check.

test.describe('Home and login', () => {
  // Test 1: home page - title plus the static "Features Items" heading (see HomePage).
  test('home page loads', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    await expect(page).toHaveTitle('Automation Exercise');
    await expect(homePage.featuresHeading).toBeVisible();
  });

  // Test 2: the Signup / Login menu link opens the login form.
  test('signup / login link opens the login form', async ({ page }) => {
    const homePage = new HomePage(page);
    const loginPage = new LoginPage(page);
    await homePage.goto();
    await homePage.header.openSignupLogin();
    await expect(page).toHaveURL('/login');
    await expect(loginPage.heading).toBeVisible();
  });

  // Test 3: wrong email and password show the error message (opens /login directly, so it
  // does not depend on the menu link that test 2 checks).
  test('invalid credentials show an error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('invalid@example.com', 'invalidpassword');
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
