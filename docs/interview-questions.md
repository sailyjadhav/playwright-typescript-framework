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
