# Failure investigations

Write-ups of failures I investigated, in STAR format (Situation, Task, Action, Result), so each can be
told as an interview story.

## 2026-10-05: Flaky product-image test

### Situation

A product-search test checked that product images were visible, but its result changed from run to
run. In 10 runs with two retries each, it passed 3 times, was flaky 5 times (failed, then passed on a
retry), and failed every attempt 3 times. On CI, retries would have turned most of those failures
green and hidden the problem.

### Task

I needed to find the root cause instead of relying on retries, and fix it so the test was reliable
without them.

### Action

I opened the trace of a flaky run. The expect step waited only 1.0 second before failing, while the
image requests in the Network tab had no end time: they were still loading when the test gave up. The
test had its own `{ timeout: 1000 }`, shorter than the up to 2 seconds the images could take. I
removed that override so the assertion uses the project's `expect.timeout` of 5 seconds.

### Result

The same test then passed 10 out of 10 runs with retries turned off. The lesson: a timeout belongs in
one place, the config, and a flaky test is a defect to investigate, not something to retry until it
passes.
