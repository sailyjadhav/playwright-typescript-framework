// API 5 from https://automationexercise.com/api_list. The search must be sent as a form:
// the same value sent as JSON is reported as a missing parameter.
import { test, expect } from '../../fixtures/api';

// The shape of the response, so TypeScript can check how the test reads it.
type Product = {
  id: number;
  name: string;
  price: string;
  brand: string;
};

type SearchProductResponse = {
  responseCode: number;
  products: Product[];
};

test.describe('Search product API', () => {
  test('POST /api/searchProduct returns matching products', async ({ request }) => {
    const response = await request.post('/api/searchProduct', {
      form: { search_product: 'Jeans' },
    });

    // The HTTP status is 200 even for errors on this API, so the body is checked as well.
    expect(response.status()).toBe(200);
    const body = (await response.json()) as SearchProductResponse;
    expect(body.responseCode).toBe(200);
    expect(body.products.length).toBeGreaterThan(0);

    expect(body.products[0]).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        name: expect.any(String),
        price: expect.any(String),
      }),
    );
  });
});
