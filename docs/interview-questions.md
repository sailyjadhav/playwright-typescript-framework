# Interview questions

Questions I practised for each session, with the short answer I would give.
Practise them aloud without the code open.

## Session 1: Code quality tooling

### Playbook self-check

**Playwright already runs TypeScript, so why add `tsc --noEmit`?**
Playwright only strips the types; it never checks them. `tsc --noEmit` is the step that actually
type-checks, so a typo like `patient.agee` fails before any test runs.

**What is the difference between ESLint and Prettier?**
ESLint finds mistakes, such as a missing `await`. Prettier fixes layout, such as quotes and spacing.
eslint-config-prettier stops them fighting.

**Why is a missing `await` dangerous, and which tool catches it?**
The test moves on without waiting, so an assertion may never be checked and the test passes falsely.
`@typescript-eslint/no-floating-promises` catches it, and `playwright/missing-playwright-await`
catches it for Playwright's own functions.

### Tooling basics

**If Playwright does not check types, where are type errors caught?**
In `npm run typecheck`. Without that step, strict mode is only a hint in the editor.

**Why use both `no-floating-promises` and `missing-playwright-await`?**
The Playwright rule only knows Playwright's functions. `no-floating-promises` uses types, so it also
catches my own async functions, such as a page-object method.

**What does eslint-config-prettier do, and why must it be last?**
It turns off ESLint's formatting rules so they do not clash with Prettier. Later configs win, so it
must be last to switch off anything turned on earlier.

### tsconfig.json

**Why add `noUncheckedIndexedAccess` when `strict` is on?**
`strict` does not include it. It catches reading a list item that may not exist, which is common with
table rows and API responses.

**What happens if `module` and `moduleResolution` do not match Node?**
The type check passes but the test fails at runtime with "Cannot find module". Setting both to
NodeNext keeps TypeScript and Node in agreement.

**Why is `"types": ["node"]` needed?**
TypeScript 6 and later no longer load `@types` packages automatically. Without it, `process.env` in
the config fails with "Cannot find name 'process'".

### .gitignore

**Why put `.DS_Store` in the project's `.gitignore`, not only a global one?**
The project file is shared with everyone who clones the repo. A global gitignore only protects my
machine.

**Does adding an already-committed file to `.gitignore` remove it?**
No. I would run `git rm --cached <file>` and commit. If it held a secret, I would also rotate the
secret, because it stays in the git history.

**How do you check which rule ignores a file?**
`git check-ignore -v <file>` shows the ignore file and the line number.

### TypeScript version

**Why TypeScript 6 instead of 7?**
typescript-eslint supports TypeScript below 6.1 only, because TypeScript 7 no longer ships the
JavaScript API it uses. The newest version is not always the right one; the whole toolchain must
work.

**What is the difference between `^6.0.3` and `~6.0.3`?**
Caret allows minor updates (6.x); tilde allows only patches (6.0.x). I used tilde because 6.1 would
break typescript-eslint.

**What are `peerDependencies`, and how did they help?**
They list the versions of shared packages a tool expects me to provide. Checking them showed the
TypeScript 7 conflict before I wrote any ESLint config.

### ESLint

**What does `projectService: true` do?**
It connects ESLint to TypeScript through tsconfig.json, so rules can see types. `no-floating-promises`
needs this to know a function returns a Promise.

**Why are Playwright rules limited to `tests/**`?**
They are written for tests, for example "every test must have an assertion". Helper files are not
tests, so the rules would give false alarms there.

**Why is `waitForTimeout` only a warning a risk?**
Warnings do not fail the lint, so hard waits could still get in. I made that one rule an error.

**What are ESLint's three rule levels?**
`off` (not checked), `warn` (message, lint still passes), `error` (lint fails).

**Why make one rule an error instead of failing on all warnings?**
I only wanted to strictly enforce "no hard waits". Failing on every warning would block the team for
small issues.

**How did you prove ESLint works?**
I planted known mistakes in a temporary test, confirmed each was caught, then deleted the file.
A check you have never seen fail is not proven.

### Quality gates page

**What is a quality gate?**
An automatic check code must pass before moving on. This project has typecheck, lint and format
check, run together with `npm run quality`.

**Why document the proof instead of keeping the broken test?**
A broken test would make lint permanently red, and `test.only` would skip every real test.

**Why does line 9 of the broken test prove both missing-await rules are needed?**
Line 9 calls my own async function. Only `no-floating-promises` caught it.

### Prettier

**Why pin Prettier to an exact version?**
Even small updates can change formatting, so everyone and CI must use the same version.

**`format` versus `format:check`: which belongs in CI?**
Developers run `format` to fix files. CI runs `format:check`, which only reports.

**Why did you need `<!-- prettier-ignore -->`?**
Prettier would have moved a comment and shifted the line numbers my proof page refers to.

**Why use eslint-config-prettier rather than eslint-plugin-prettier?**
The config just switches off clashing rules. The plugin runs Prettier inside ESLint, which is slower
and floods the editor with formatting errors that hide real bugs.

**Why update the docs in the same session as the tool?**
Docs that do not match the code are wrong. New people would follow the page and still fail CI.

### Pull request

**Why use a branch and a pull request when working alone?**
Main always works, I get a review step, and it is the same workflow a team uses.

**Merge commit or squash and merge?**
A merge commit keeps every commit; squash combines them into one. My commits were small and
meaningful, so I kept them.

**The PR has a ticked test plan but no CI checks. What does that mean?**
The checks ran only on my machine, so the reviewer must trust me. Session 11 adds GitHub Actions so
every PR is checked automatically.

## Session 2: The config file

### Playbook questions

**Why retries on CI but not locally?**
On CI, retries separate real failures from flaky ones, and the first retry records a trace for
evidence. Locally I use zero retries so I see failures immediately. Retries label flakiness; they do
not fix it.

**What does `baseURL` give you when the app moves to a staging server?**
Tests use short paths like `/login`, so moving to staging means changing `BASE_URL` once, in `.env`
or in CI, with no test changes. I can also override it for one run from the command line.

**Why is `.env` ignored but `.env.example` committed?**
`.env` holds real values, and later secrets, so it is never committed. `.env.example` is a template
listing the settings with safe values; a new person copies it to `.env`. My fail-fast error points
to it.

### The config file

**What is the difference between `.env`, dotenv and `process.env`?**
`.env` is the file that holds the values. dotenv is the package that reads it into `process.env`.
The config only reads `process.env`, so it works locally from `.env` and on CI from CI's own
environment variables.

**Why does the config throw when `BASE_URL` is missing instead of using a default?**
A default could quietly test the wrong environment and give a false pass. A clear error that points
to `.env.example` takes seconds to fix.

**Why is `video` `retain-on-failure` but `screenshot` `only-on-failure`?**
A screenshot can be taken at the moment of failure. A video must be recorded from the start, so
Playwright records every test and keeps the video only if it failed.

**Typecheck and lint passed with `testDir: '/test'`, but no tests were found. Why?**
Static checks confirm code is well-formed, not that values are right. To TypeScript, `'/test'` is
just a string. Running the tests found it, which is why Gate 3 includes a real test run.

### Break drills

**What happens with `test.only` when `CI=true`?**
`forbidOnly` stops the run before any test starts and points at the exact line. On my laptop,
`.only` is allowed for debugging.

**A test fails with one retry. What evidence do you get?**
The test runs twice. Both attempts save a screenshot and a video; only the retry records a trace,
because trace is set to `on-first-retry`.

### The quality script

**What does `&&` do in the `quality` script?**
It runs the next command only if the previous one passed, so `quality` stops at the first failure
with one clear error.

**What is an exit code, and why does CI care?**
The number a command returns: 0 for success, anything else for failure. CI uses it to decide pass
or fail. My `quality` script returned 2 with a planted type error.

**Why a single `quality` command when the three scripts exist?**
One command is easy to remember and impossible to half-run. My laptop and CI run the same checks,
and a new check is added in one place.

## Session 3: First real test

### Playbook questions

**Why `getByRole` over a CSS selector?**
getByRole describes what the user sees, so it survives markup changes and also checks
accessibility. CSS describes internal structure and breaks when the layout changes. I use anything
else only where nothing semantic works, and explain the exception in a comment.

**How does `toBeVisible` avoid a hard wait?**
It is web-first: it retries until the element is visible or the 5-second expect timeout runs out,
so it waits exactly as long as needed. My ESLint config blocks `waitForTimeout` completely.

**When is a non-retrying assertion correct?**
When the value is already final, such as a count I captured, an API status code or computed data.
Anything on a live page gets a web-first assertion.

### My first tests

**Why does the home page test not check the big "AutomationExercise" heading?**
It sits in a sliding carousel. I checked it 141 times over 15 seconds and 12 times two copies were
visible, which fails strict mode at random. I chose the static "Features Items" heading instead of
hiding the problem with `.first()`.

**Why is `getByTestId` acceptable for the login fields but not everywhere?**
The fields have no labels and the page has three "Email Address" boxes, so nothing semantic gives
one match. The site's `data-qa` attribute does, set once as `testIdAttribute` in the config. Every
other locator is getByRole.

**Why does test 3 open `/login` directly instead of clicking the menu link?**
So the tests stay independent. Test 2 already checks the link; if it breaks, only test 2 fails and
test 3 still reports whether login errors work.

### Break drills

**Why does a wrong locator on a click fail after 30 seconds, but a failed assertion after 5?**
Actions wait until the test timeout (30 s); assertions retry for the expect timeout (5 s). The
timing of a failure tells me which kind of step failed.

**The expected text was wrong but the real message appeared. Why did the test fail?**
A test checks exactly what I wrote, not what I meant. The trace snapshot showed the real message,
which proved it was a test bug, not an app bug.

**What does an offline failure look like compared with a server error?**
Offline gives `net::ERR_INTERNET_DISCONNECTED` almost instantly, with no status code, because no
server was reached. A status like 403 or 502 means the server answered with an error.

## Session 4: Page Object Model

### Playbook questions

**Why are assertions kept out of page objects?**
So actions stay reusable: `login()` serves both the wrong-password and the correct-password tests,
and only the test knows what to check. It also keeps assertions web-first, because the test calls
`expect` on the page object's locator.

**When would you use a component object?**
For any UI part that repeats across pages, such as the header, footer or a modal. Pages include it
by composition, so its locators exist once and a change to it is one edit. A part that appears on
only one page stays in that page class.

**What are the risks of a large base page class?**
It becomes a dumping ground: every page inherits everything, pages carry helpers they do not need,
a change ripples into unrelated tests, and you must read two classes to understand one. I use
composition instead.

### My page objects

**What does the constructor do in a page object?**
It runs once when a test calls `new LoginPage(page)`, receives that test's page and builds every
locator. Locators are lazy descriptions, so creating them before navigating is safe.

**Why are the locators `readonly`?**
They are fixed after construction, so no test can reassign them. With strict mode, this also caught
my misspelled `constructor`: six fields were reported as never initialised before any test ran.

**What is the difference between composition and inheritance?**
Inheritance is "is a": the child gets everything from the parent automatically. Composition is
"has a": an object is built from smaller parts it chooses. `HomePage` has a `Header`.

### Break drill

**How did you prove the Page Object Model helps?**
I changed one locator in `LoginPage`. Only the test using it failed, on all three browsers, with
"element(s) not found", and the other six runs passed. Fixing that one line restored all nine.

## Session 5: Custom fixtures

### Playbook questions

**Why fixtures instead of `beforeEach`, and when?**
Fixtures are on-demand, typed and reusable across files, and they keep setup and teardown together
around `use`. Test 3 asks only for `loginPage`, so no `HomePage` is created for it. For simple setup
that every test in one small file needs, `beforeEach` is fine and easier to read.

**When would you choose worker scope?**
For expensive, read-only setup such as an auth token or a database connection, created once per
worker and shared. In a drill, nine tests created a worker fixture three times with one worker (once
per browser) but eight times with four workers. Anything a test can change, or anything that needs a
page, stays test-scoped.

**What code runs after `await use()`?**
Teardown: it runs after the test finishes, even when the test fails. The `await` is essential;
without it, teardown runs before the test.

### My fixtures

**What is a fixture, in one sentence?**
A recipe that prepares something for a test, hands it over with `use`, and cleans up afterwards; the
test just asks for it by name. Playwright's own `page` is a fixture.

**Why do all tests import `test` and `expect` from your fixture file?**
It is the single front door: a fixture added there is available in every test without changing
imports. I checked that eslint-plugin-playwright still recognises my custom `test`.

### Break drills

**How did a passing test hide a bug?**
With `await` removed before `use`, the test still passed, but the logs showed teardown running before
the test. ESLint's `no-floating-promises` caught it even though the test did not, which is why lint is
a separate quality gate.

**In what order do setup, test and teardown run?**
Setup, then the test, then teardown; the log lines printed 1, 2, 3, and teardown still printed when
the test failed.

## Session 6: Data-driven tests

### Playbook questions

**When is a soft assertion the wrong choice?**
When later steps depend on it. If the page did not load or login failed, carrying on only produces
confusing follow-on failures. My search test uses hard assertions for the heading and first result,
and soft ones for each product name.

**How do you keep data-driven tests independent in parallel runs?**
Each row becomes its own test that sets itself up, gets a fresh page from test-scoped fixtures and
shares no changeable state. Titles come from the data, so they are unique. When a test creates data,
such as an account, I make it unique per run with a timestamp so parallel workers never collide.
(This is about independent tests, not soft assertions, which are about independent checks inside one
test.)

**Why type your test data?**
A malformed row fails at typecheck, before any test runs, with the exact line and often a suggested
fix. In a drill, a number instead of an email and a typo in a field name were both caught by
typecheck; run without it, they failed mid-test with confusing errors. Lint did not catch them,
because lint checks code patterns, not types.

### My data-driven tests

**Why two separate loops for invalid login?**
The site rejects bad logins in two ways: the server shows an error, or the browser blocks the form
and marks a field invalid. Each needs a different check, and separate loops keep if/else out of the
tests.

**Why check `validity.valid` instead of the browser's message?**
The wording differs per browser ("Please fill out this field." versus "Fill out this field"). The
validity state is the same everywhere, and I confirmed it fails for a valid email.

**How did you choose your search test data?**
I checked the live site first: search also matches categories, so "Top" returns shirts. I kept terms
whose results all contain the term in the name, plus one term with no results.

### Break drills

**What happened when two rows produced the same title?**
Playwright refused to run with "duplicate test title". I had used normal quotes instead of backticks,
so `${...}` was not filled in and every row got the same title.

**What does a failing soft assertion look like?**
With "Top", all 14 names were checked, both shirts were reported in one run, and the test was marked
failed at the end.

## Session 7: Authentication

### Playbook questions

**Why save the state instead of logging in for every test?**
Logging in once per run is faster, gives one clearly labelled place where login can fail
(`[setup] › authenticate`), and keeps each test to the steps it is actually testing. When my password
was wrong, only the setup step failed, with a clear screenshot.

**What are the risks of a shared logged-in state across parallel tests?**
Every test that loads the saved state is the same user at the same time. If one logs out, the server
can end the session for the others; if one changes the cart, another test sees it; a long run can
outlive the session. Shared-state tests only read, and anything that changes account data or logs out
uses its own account, for example one per worker with a worker-scoped fixture.

**How do credentials reach the tests in CI?**
They are stored as encrypted GitHub repository secrets, and the workflow passes them in as
environment variables. My code reads `process.env` either way: locally from the git-ignored `.env`
via dotenv, in CI from the environment, where dotenv finds no file and changes nothing. GitHub masks
the values in logs.

### My authentication setup

**Why does the setup check the Logout link before saving the state?**
So a failed login is never saved as if it worked. With a wrong password, setup failed clearly and no
auth file was created, instead of every logged-in test failing later with a confusing error.

**Why must `playwright/.auth/user.json` never be committed?**
It holds a live login cookie: anyone with the file is logged in as the test user without the
password. It lives in the git-ignored `.auth/` folder, which I confirmed with `git check-ignore -v`.

**Why logged out by default, with logged-in specs opting in?**
Most of the suite tests the login form and invalid logins, which must start logged out, so opting in
one file is safer than opting out every other file. I would switch if most tests needed a login.

### Break drills

**What happens when the saved auth file is deleted?**
The setup project runs first as a dependency and recreates it. Setup runs on every run, so the saved
login is always fresh.

**What happens if a login-form test starts logged in?**
It fails: the click on "Signup / Login" waits 30 seconds, because a logged-in user sees "Logout" and
"Logged in as" instead. That is the risk of a forgotten opt-out.

**How did you tell a real failure from the flaky page load?**
I re-ran the test. The failures said `page.goto … waiting until "load"`, a slow third-party page load,
and they happened with or without the auth file, so they were unrelated to my change.

## Session 9: Network control

(Session 9 was done before Session 8 to fix a failing test on main.)

### Playbook questions

**When should a UI test mock the network, and when is that dangerous?**
Mock or block what is outside the test's job, such as ads, or states that are hard to create, such as
server errors or a failed image server. Do not mock the feature under test, and keep mocks the same
shape as the real response: a wrong-shape mock fails for no real reason, and a stale mock can pass
while the real app is broken. This site is mostly server-rendered, so there are few API calls to
mock; routing was used to block third parties and simulate failures.

**How do you prove a click triggered the right request?**
Start `page.waitForResponse` before the click, matching the URL and method (the POST to `/login`),
then await it and check the status. A click can raise no error while nothing happens, so this proves
the request actually reached the server.

**Why block third-party ads in tests?**
They are someone else's system and add noise. One ad request never finished, so `page.goto` waited
for the load event until the 30 s timeout: the logged-in test failed 4 of 4 on Chromium. An automatic
fixture that aborts every request not going to the site made it pass 5 of 5, and the suite went from
about 54 s to 50 s. Reliability was the main gain.

### My network setup

**Why an allowlist instead of a list of ad domains?**
Ad networks change from load to load; the domain that hung the test did not appear in a later list of
nine third-party hosts. Allowing only the site blocks new ad domains automatically and follows
`BASE_URL`.

**Why route at the browser context level, not the page level?**
The context sees requests from iframes and pop-ups too, and ads usually load in iframes.

**Why does the image-abort test count the aborted requests?**
So it proves its route matched. With a pattern that matched nothing, everything else in the test still
passed and only the counter caught it.

### Break drills

**What happens if you abort the site's own JavaScript?**
The page still loads, because it is server-rendered, and typing and clicking raise no error, but
search does nothing because the search button only works through JavaScript. No error on a click does
not mean the click worked; only the assertion afterwards proves the result.

**What happens with a mock of the wrong shape?**
Answering the search page with JSON made the browser show the raw text instead of a page, so the
results heading was never found.
