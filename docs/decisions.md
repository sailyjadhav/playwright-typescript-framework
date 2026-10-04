# Decision log

## 2026-10-04: Block third-party requests in an automatic fixture

- Decision: fixtures/pages.ts has an automatic fixture, blockThirdPartyRequests, that routes the browser context and aborts every request whose host is not the host of baseURL.
- Reason: The logged-in home test failed on Chromium in 4 of 4 runs because page.goto waits for the load event, and a third-party ad request (gum.criteo.com) never finished. As an automatic fixture it covers every test and the auth setup with no test changes, and routing the context also catches ads in iframes. After the change the same test passed 5 of 5, and the suite went from about 54 s to about 50 s.
- Alternative rejected: A test-by-test fixture would be visible in each test but easy to forget in one, which would bring the flake back for that test.

## 2026-10-04: Allowlist the site instead of listing ad domains

- Decision: The blocking rule allows only the site under test and aborts everything else, including Google Fonts.
- Reason: Ad networks change from load to load: the domain that hung the test did not appear at all in a later measurement of nine third-party hosts. An allowlist blocks new ad domains automatically, and it follows BASE_URL if the tests point at another environment.
- Alternative rejected: A blocklist of named ad domains keeps fonts loading, but it misses any ad domain not on the list and needs constant updating.

## 2026-10-04: Credentials checked in the setup file, not the config

- Decision: tests/auth.setup.ts reads TEST_USER_EMAIL and TEST_USER_PASSWORD from .env and throws a clear error if either is missing, at the top of the file rather than inside the test.
- Reason: Only the setup step needs the credentials, and failing fast gives a clear message instead of a confusing login failure. Placing the check outside the test keeps the eslint-plugin-playwright rule no-conditional-in-test satisfied.
- Alternative rejected: Checking in playwright.config.ts would stop every test, including logged-out ones, whenever the credentials were missing.

## 2026-10-04: Logged out by default; logged-in specs opt in

- Decision: The browser projects do not load the saved login. A spec that needs a logged-in user opts in with test.use({ storageState: 'playwright/.auth/user.json' }); today that is only tests/ui/account.spec.ts.
- Reason: Most of the suite tests the login form and invalid logins, which must start logged out. Opting in one file is safer than opting out every other file, where a forgotten opt-out breaks the login tests.
- Alternative rejected: Loading the saved state for every test and opting out in the login specs suits an app where most tests need a logged-in user. I would switch to it if that becomes true here.

## 2026-10-04: Setup project for authentication

- Decision: A setup project runs tests/auth.setup.ts first; it logs in with the loginPage fixture, checks the Logout link is visible, and saves the browser state to playwright/.auth/user.json. The browser projects declare it as a dependency.
- Reason: Logging in once is faster and gives one place where login can fail instead of every test. As a project, the login appears in the report and trace and can use my fixtures. The saved file holds a live session, so it lives in the git-ignored playwright/.auth/ folder, confirmed with git check-ignore.
- Alternative rejected: globalSetup runs a plain function before all tests, but outside the test runner, so a failed login has no trace, report entry or fixtures.

## 2026-10-03: Removed the single invalid-login test from home-and-login.spec.ts

- Decision: I deleted the "invalid credentials show an error message" test, because the data-driven "unknown email" row in invalid-login.spec.ts checks exactly the same thing.
- Reason: Two tests for one condition add run time and maintenance without adding coverage. The data-driven version covers that case and six more.
- Alternative rejected: Keeping it as a simple example beside the page-object tests would duplicate coverage, and the data-driven spec already shows the pattern.

## 2026-10-03: Search terms limited to ones that match product names

- Decision: The product search test uses terms whose results all contain the term in the product name (Jeans, Saree, Polo, Blue), plus one term with no results.
- Reason: Before writing the assertion I checked the live site: its search also matches categories, so "Top" returns shirts filed under Tops and "Dress" returns a gown. With those terms, "every result contains the term" would fail even though search works.
- Alternative rejected: Checking that one expected product appears would work for any term, but it ignores every other result. Exact result counts would break whenever the shop adds a product.

## 2026-10-03: CSS exceptions on the products page

- Decision: ProductsPage finds the search button by its id (#submit_search) and the result names by .productinfo p, each with a comment explaining why.
- Reason: The search button is an icon with no text or label, so it has no accessible name and getByRole cannot find it; that is also an accessibility gap for screen-reader users. Product cards have no roles or test IDs, and each name repeats in a hover overlay.
- Alternative rejected: Opening /products?search=term directly would avoid CSS, but it would skip the search box and button that a user actually uses.

## 2026-10-03: Browser validation checked by field state, not message text

- Decision: Cases the browser rejects (empty fields, malformed email) are checked with toHaveJSProperty('validity.valid', false) on the field named in the data row.
- Reason: The browser blocks these before the form is sent, and its message wording differs per browser ("Please fill out this field." in Chromium and Firefox, "Fill out this field" in WebKit). The validity state is the same everywhere. I confirmed the check fails for a valid email, so it cannot pass falsely.
- Alternative rejected: Asserting the message text would need a different expected value per browser.

## 2026-10-03: Separate data-driven loops per kind of outcome

- Decision: Invalid-login cases are split into two typed lists, rejectedByServer (expects the site's error message) and rejectedByBrowser (expects an invalid field), each with its own loop.
- Reason: The site rejects bad logins in two different ways, so the expected result differs. Separate loops keep each test free of if/else, which eslint-plugin-playwright's no-conditional-in-test rule discourages, and every run of a test takes the same path.
- Alternative rejected: One list with a type field and an if/else inside the test would mean different rows take different paths through the same test.

## 2026-10-02: Named type for the fixture list

- Decision: fixtures/pages.ts declares a named type, PageFixtures, listing every fixture and its type, and passes it to base.extend<PageFixtures>.
- Reason: The named type reads like a menu of what the file offers, and it stays readable as fixtures are added, one line per fixture.
- Alternative rejected: Writing the type inline, base.extend<{ loginPage: LoginPage; homePage: HomePage }>, works the same but grows into one long line that is harder to scan.

## 2026-10-02: Page objects as fixtures instead of beforeEach

- Decision: Tests receive page objects as fixtures, for example async ({ loginPage }) => ..., and every test imports test and expect from fixtures/pages.ts.
- Reason: Fixtures are created only for tests that ask for them, are fully typed, and can be reused in any test file. Setup and teardown sit together around use(), so later fixtures that need cleanup, such as a temporary user, keep it in one place.
- Alternative rejected: beforeEach with an outer let variable is simpler to read, but it runs for every test in the group whether needed or not, works only inside one file, and shares state through a variable that can be reassigned by mistake.

## 2026-09-30: Page objects expose locators; assertions stay in tests

- Decision: Page objects expose their locators as readonly properties, and tests assert on them, for example `await expect(loginPage.errorMessage).toBeVisible()`. Page objects contain actions only, never assertions.
- Reason: `expect(locator)` is a web-first assertion that retries until the timeout, so tests keep Playwright's auto-waiting. Keeping assertions out of pages lets the same action serve different tests: `login()` is used for both a wrong and a correct password.
- Alternative rejected: Methods such as `isErrorShown()` that return true or false would hide an `isVisible()` call, which checks only once and brings back the flakiness web-first assertions remove.

## 2026-09-30: Only create page objects that tests use

- Decision: I created LoginPage, HomePage and the Header component now, and will add ProductsPage and CartPage in the session whose tests need them.
- Reason: A locator that no test uses is never checked, so it could be wrong without anyone noticing. Every class in the repo should be used and explainable.
- Alternative rejected: Creating every page from the playbook list now would match the list, but it would add untested code.

## 2026-09-30: Composition for shared page parts

- Decision: Pages contain shared parts as components, for example `HomePage` has a `header: Header`, instead of extending a base page class.
- Reason: Each page shows exactly what it has, a change to a component only affects pages that use it, and there is no base class that grows with every "just one more helper".
- Alternative rejected: A BasePage that every page extends means less typing at first, but every page inherits everything in it, and over time it becomes a large class where one change can break unrelated pages.

## 2026-09-29: Removed tests/example.spec.ts

- Decision: I deleted the example test that the Playwright setup wizard created.
- Reason: It tested playwright.dev, not Automation Exercise, and my own tests in tests/ui/ now cover the application. Keeping it would add runs and results that say nothing about my app.
- Alternative rejected: Keeping it as a syntax reference would mix sample code with my work; the same example is always in the Playwright documentation.

## 2026-09-29: getByTestId with data-qa for the login form fields

- Decision: The login email and password fields are found with getByTestId, and playwright.config.ts sets testIdAttribute to data-qa, the attribute the site already uses.
- Reason: getByLabel is impossible because the fields have no labels, and getByRole('textbox', { name: 'Email Address' }) matches three boxes on the page (login, signup and newsletter), which fails Playwright's strict mode. data-qa gives exactly one match. Every other locator stays semantic (getByRole).
- Alternative rejected: Narrowing to the login form first (a form that has a Login button, then getByRole inside it) keeps the locator closer to what the user sees, but needs a CSS 'form' selector and a longer chain; codegen suggested a similar chain.

## 2026-09-29: Home page test checks the static "Features Items" heading

- Decision: Test 1 checks the page title and the "Features Items" heading instead of the large "AutomationExercise" heading.
- Reason: The large heading sits in a sliding carousel. I checked it 141 times over 15 seconds and 12 times two copies were visible during a slide change, which would fail strict mode at random and make the test flaky.
- Alternative rejected: Using .first() on the carousel heading would pass, but it hides the ambiguity instead of fixing it and still depends on moving content.

## 2026-09-29: Fail fast when BASE_URL is missing

- Decision: The config throws a clear error when BASE_URL is missing, and the message tells the reader to set it in .env (see .env.example).
- Reason: Without this check, a missing or broken setting could make the tests run against the wrong site and still pass. Stopping straight away is safer than guessing. Break drill 1 confirmed the run stops before any browser opens.
- Alternative rejected: Falling back to a default address would "just work", but it could silently test the wrong environment and give a false pass.

## 2026-09-29: dotenv to load .env

- Decision: I used the dotenv package, with quiet: true, so the Playwright config reads BASE_URL from the .env file.
- Reason: On CI there is no .env file, because it is not committed; CI will provide BASE_URL as an environment variable instead. dotenv skips a missing file quietly, so the same config works on my laptop and on CI. It is also the approach the Playwright template suggests.
- Alternative rejected: Node's built-in process.loadEnvFile() needs no install, but it throws an ENOENT error when .env is missing, so I would need extra code to handle CI.

## 2026-09-28: Prettier for formatting, with eslint-config-prettier

- Decision: I added Prettier (single quotes, 100-character lines), pinned to an exact version, and eslint-config-prettier as the last item in the ESLint config.
- Reason: ESLint finds mistakes and Prettier handles layout, so each tool has one job. eslint-config-prettier turns off ESLint's formatting rules so the two tools never fight. I pinned Prettier exactly because even small updates can change formatting, and then everyone would see unrelated changes.
- Alternative rejected: eslint-plugin-prettier runs Prettier inside ESLint, which means one command, but it is slower and fills the editor with formatting underlines that hide real mistakes. The Prettier docs advise against it.

## 2026-09-28: ESLint with typescript-eslint and eslint-plugin-playwright

- Decision: I added ESLint with three rule sets: basic JavaScript rules, type-aware TypeScript rules, and Playwright rules limited to the tests folder. I also changed no-wait-for-timeout from a warning to an error.
- Reason: The type-aware rule no-floating-promises catches a missing await, even on my own functions, which would otherwise let a test pass without checking anything. Warnings do not fail the lint, so I made hard waits an error to enforce the "no hard waits" rule.
- Alternative rejected: Biome is faster and combines linting and formatting in one tool, but it has no mature Playwright plugin and weaker missing-await checking.

## 2026-09-28: TypeScript 6.0 instead of TypeScript 7

- Decision: I pinned TypeScript to ~6.0.3 (patch updates only) instead of the latest TypeScript 7.
- Reason: typescript-eslint, which ESLint needs to read TypeScript files and to provide no-floating-promises, only supports TypeScript below 6.1. TypeScript 7 was rebuilt as a native program and no longer ships the JavaScript API that typescript-eslint uses. I will upgrade when typescript-eslint supports TypeScript 7.
- Alternative rejected: Keeping TypeScript 7 and using a newer linter such as Oxlint would be faster, but it has no mature Playwright plugin and is less common in QA teams than ESLint.

## 2026-09-28: Type-checking with tsconfig.json and npm run typecheck

- Decision: I added a tsconfig.json with strict mode and noUncheckedIndexedAccess turned on, and an `npm run typecheck` script that runs `tsc --noEmit`.
- Reason: Playwright runs TypeScript files but does not check the types, so without tsc, type errors could reach CI unnoticed. Strict mode does not include noUncheckedIndexedAccess, so I turned it on separately to catch missing items in lists and API responses before the tests run. I also set "types": ["node"] because TypeScript 6 and later no longer load @types packages automatically, and the Playwright config uses process.env.
- Alternative rejected: Extending a ready-made base config such as @tsconfig/node22 would have meant less typing, but the settings would be hidden inside a package, and I could not explain each one in an interview.

## 2026-09-26: Demo application for the framework

- Decision: I chose Automation Exercise (automationexercise.com) as the application under test.
- Reason: It supports both UI and API testing in one application (login, product catalogue, cart, and a published list of API endpoints), so every session in this framework tells one consistent story.
- Alternative rejected: SauceDemo covers only UI, so I would have needed a second application such as Restful Booker for API testing, which splits the framework across two unrelated apps.

## 2026-09-24: GitHub Actions workflow not generated at setup

- Decision: I answered No when the Playwright setup wizard offered to create a GitHub Actions workflow.
- Reason: I want to write the CI workflow myself in Session 11, so I understand every line (triggers, runner, install steps, test run, report artifact) and can explain it in an interview.
- Alternative rejected: Letting the wizard generate the workflow would have given me a working pipeline immediately, but it would be code I did not write or fully understand.

## 2026-09-24: Removed the tests-examples folder

- Decision: I deleted the tests-examples folder that the setup wizard created.
- Reason: It contains a sample to-do app test written by the Playwright team, not by me, and it does not test my chosen application, so it adds noise to a portfolio framework.
- Alternative rejected: Keeping it as a reference would have mixed sample code with my own work; the same examples are always available in the Playwright documentation.
