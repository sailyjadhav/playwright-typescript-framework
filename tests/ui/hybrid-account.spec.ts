import { test, expect } from '../../fixtures/pages';
import { accountForm } from '../../data/temp-user';
import type { ApiMessageResponse, UserDetailResponse } from '../../utils/api-types';

// Hybrid test: the API creates, updates and deletes a throwaway account (the tempUser fixture),
// and only the login, the part under test, goes through the UI.
// Tagged @creates-account because it creates and deletes a real account on the site; exclude it
// with --grep-invert @creates-account.
test.describe('Account created through the API', () => {
  test('can be updated and used to log in @creates-account', async ({
    tempUser,
    request,
    loginPage,
    homePage,
  }) => {
    // API 13: update the account.
    const updated = await request.put('/api/updateAccount', {
      form: accountForm(tempUser, 'Updated Co'),
    });
    expect(((await updated.json()) as ApiMessageResponse).responseCode).toBe(200);

    // API 14: the change is stored.
    const detail = await request.get('/api/getUserDetailByEmail', {
      params: { email: tempUser.email },
    });
    const body = (await detail.json()) as UserDetailResponse;
    expect(body.responseCode).toBe(200);
    expect(body.user.company).toBe('Updated Co');

    // UI: the account logs in through the real login page.
    await loginPage.goto();
    await loginPage.login(tempUser.email, tempUser.password);
    await expect(homePage.header.logoutLink).toBeVisible();
  });
});
