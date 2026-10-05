// Negative cases from https://automationexercise.com/api_list. This API answers errors with
// HTTP 200 and puts the real result in the body's responseCode, so a status check alone would
// pass on every one of these failures.
import { test, expect } from '../../fixtures/api';
import type { ApiMessageResponse } from '../../utils/api-types';

test.describe('API error responses', () => {
  test('POST to the products list is rejected as an unsupported method', async ({ request }) => {
    // API 2: the products list only supports GET.
    const response = await request.post('/api/productsList');

    expect(response.status()).toBe(200);
    const body = (await response.json()) as ApiMessageResponse;
    expect(body.responseCode).toBe(405);
    expect(body.message).toBe('This request method is not supported.');
  });

  test('user details for an unknown email are not found', async ({ request }) => {
    // API 14 with an email that has no account.
    const response = await request.get('/api/getUserDetailByEmail', {
      params: { email: 'nobody.unknown@example.com' },
    });

    expect(response.status()).toBe(200);
    const body = (await response.json()) as ApiMessageResponse;
    expect(body.responseCode).toBe(404);
    expect(body.message).toBe('Account not found with this email, try another email!');
  });
});
