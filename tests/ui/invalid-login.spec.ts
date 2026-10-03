import { test, expect } from '../../fixtures/pages';
import { rejectedByBrowser, rejectedByServer } from '../../data/login-cases';

test.describe('Invalid login rejected by server', () => {
  for (const invalidCase of rejectedByServer) {
    test(`shows the error for: ${invalidCase.title}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(invalidCase.email, invalidCase.password);
      await expect(loginPage.errorMessage).toBeVisible();
    });
  }
});

// The browser blocks these before sending the form. Its message wording differs per browser,
// so the test checks the field's validity state instead of the message text.
test.describe('Invalid login rejected by the browser', () => {
  for (const invalidCase of rejectedByBrowser) {
    test(`marks the field invalid for: ${invalidCase.title}`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(invalidCase.email, invalidCase.password);
      await expect(loginPage[invalidCase.invalidField]).toHaveJSProperty('validity.valid', false);
    });
  }
});
