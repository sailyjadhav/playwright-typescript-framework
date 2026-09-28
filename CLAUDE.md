# Project: playwright-typescript-framework

Purpose: Public portfolio framework for a QA Lead with 12 years of healthcare EHR testing.
Every file must be explainable in an interview, so prefer clear over clever.

## Rules

- Always propose a plan and wait for approval before writing code.
- One concept per change. Do not refactor unrelated files.
- Use semantic locators (getByRole, getByLabel) unless impossible; explain any exception.
- No hard waits (waitForTimeout). Use web-first assertions.
- Keep secrets out of the repo; use .env with a committed .env.example.
- After every change, run the affected tests and show the result.
- Add a short comment only where the reasoning is not obvious.

## Teaching mode (always on)

- The owner of this repo is using it to learn and must defend every line in interviews.
- Before implementing any new concept, explain what it is, why it is used,
  and one alternative with trade-offs. Wait for confirmation.
- For the FIRST instance of any pattern, do not write the code. Give a skeleton
  with TODO(human) comments and guide me while I write it. Review my version afterwards.
- For every change, end with: "Three interview questions about this change"
  (questions only, no answers).
- Never introduce a library, config option, or pattern without saying why.
- If I ask you to "just do it", still list the decisions you made at the end.

## Stack

Playwright Test, TypeScript (strict), ESLint + Prettier, GitHub Actions.
Target app: https://automationexercise.com

## Structure

pages/ components/ fixtures/ tests/ui tests/api data/ utils/ docs/
