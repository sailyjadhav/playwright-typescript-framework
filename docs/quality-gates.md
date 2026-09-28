# Quality gates

Quality gates are automatic checks that stop mistakes before the tests run.
Playwright runs TypeScript but does not check it, so these checks fill that gap.

## The checks

| Command             | What it catches                                                       | Example                                     |
| ------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| `npm run typecheck` | Type mistakes: typos in property names, values that might be missing  | `patient.agee` instead of `patient.age`     |
| `npm run lint`      | Risky code patterns: missing `await`, hard waits, `test.only` left in | `expect(...).toBeVisible()` without `await` |

Run both before every commit. Both must show zero errors.

## Proof: TypeScript catches type mistakes

I planted two mistakes in a temporary file:

```ts
const patient = { name: 'John', age: 45 };
const ages: number[] = [45];
console.log(patient.agee); // typo
console.log(ages[5].toFixed()); // item 5 does not exist
```

`npm run typecheck` caught both:

```text
error TS2551: Property 'agee' does not exist on type '{ name: string; age: number; }'. Did you mean 'age'?
error TS2532: Object is possibly 'undefined'.
```

- The first error comes from `strict` mode.
- The second comes from `noUncheckedIndexedAccess`, which `strict` does not include.

## Proof: ESLint catches risky test code

I planted four mistakes in a temporary test:

<!-- prettier-ignore -->
```ts
import { test, expect } from '@playwright/test';

async function saveAllergy(): Promise<void> {}

test.only('broken demo', async ({ page }) => {            // line 5: test.only left in
  await page.goto('https://playwright.dev/');
  await page.waitForTimeout(3000);                        // line 7: hard wait
  expect(page.getByRole('heading')).toBeVisible();        // line 8: missing await
  saveAllergy();                                          // line 9: missing await on my own function
});
```

`npm run lint` caught all of them:

| Line | Mistake                            | Rule that caught it                                                                 |
| ---- | ---------------------------------- | ----------------------------------------------------------------------------------- |
| 5    | `test.only` left in                | `playwright/no-focused-test`                                                        |
| 7    | Hard wait                          | `playwright/no-wait-for-timeout`                                                    |
| 8    | Missing `await` on `expect`        | `@typescript-eslint/no-floating-promises` and `playwright/missing-playwright-await` |
| 9    | Missing `await` on my own function | `@typescript-eslint/no-floating-promises` only                                      |

Line 9 shows why both rules are needed: the Playwright rule only knows Playwright's own functions,
while `no-floating-promises` uses types, so it also catches my own async functions.

## How to reproduce

1. Copy one of the broken snippets above into a new file in `tests/`.
2. Run `npm run typecheck` or `npm run lint` and compare the errors with this page.
3. Delete the file, then run both commands again to confirm zero errors.
