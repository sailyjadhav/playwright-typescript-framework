# Decision log

## 2026-09-28: Type-checking with tsconfig.json and npm run typecheck
- Decision: I added a tsconfig.json with strict mode and noUncheckedIndexedAccess turned on, and an `npm run typecheck` script that runs `tsc --noEmit`.
- Reason: Playwright runs TypeScript files but does not check the types, so without tsc, type errors could reach CI unnoticed. Strict mode does not include noUncheckedIndexedAccess, so I turned it on separately to catch missing items in lists and API responses before the tests run. I also set "types": ["node"] because TypeScript 7 no longer loads @types packages automatically, and the Playwright config uses process.env.
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