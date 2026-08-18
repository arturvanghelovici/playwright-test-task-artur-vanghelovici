# playwright-test-task-artur-vanghelovici

Playwright + TypeScript automation suite for [saucedemo.com](https://www.saucedemo.com/), plus the manual QA deliverables (`MANUAL-TESTS.md`, `BUGS.md`) for the same app.

## How to install and run (fresh machine)

Requirements: Node.js 22.x and npm (no other services, databases, or local servers needed, tests run against the live public site).

```bash
git clone https://github.com/arturvanghelovici/playwright-test-task-artur-vanghelovici.git
cd playwright-test-task-artur-vanghelovici
npm ci
npx playwright install --with-deps
```

Then:

```bash
npm test           # run the full suite headless, all browsers
npm run test:headed
npm run test:ui
npm run test:report
npm run typecheck
npm run lint
npm run format
```

`npm test` (and every other run command) automatically executes the `setup` project first (`tests/auth.setup.ts`), which logs in once as `standard_user` and saves the authenticated session to `playwright/.auth/`, no manual login step is required.

## Project structure

`tests/` holds the spec files (`login.spec.ts`, `cart.spec.ts`, `checkout.spec.ts`, `e2e.spec.ts`) plus `auth.setup.ts`, the Playwright "setup project" that logs in once and persists `storageState`. `pages/` holds one Page Object class per screen (`LoginPage`, `ProductsPage`, `ProductDetailPage`, `CartPage`, `CheckoutPage`, `CheckoutOverviewPage`, `CheckoutCompletePage`), and `components/HeaderComponent.ts` factors out the cart badge/link shared across every authenticated page. `data/` centralizes test data as typed constants rather than magic strings: `routes.ts` (a `Route` enum of URL paths), `users.ts` (the `SauceDemoUser` enum and shared password), and `auth.ts` (the storageState file path). Tooling config lives at the root: `playwright.config.ts`, `eslint.config.mjs`, `tsconfig.json`, `.prettierrc.json`; CI is `.github/workflows/playwright.yml`. `MANUAL-TESTS.md` and `BUGS.md` are the Part 1 manual-QA deliverables, with supporting screenshots/recordings in `bugs/attachments/`.

## Design decisions and trade-offs

Page Object Model was used as-is (no alternative pattern needed justification), with two deliberate refinements: assertions live directly in tests rather than wrapped in POM methods, except for genuinely multi-field checks (`expectDetails`, `expectItemVisible`) where collapsing 3 comparisons into one named call avoids real duplication, everything else uses the page object's public locators directly so a failure's stack trace points at the test line, not a buried helper. Locators favor `getByRole`/`getByText` where the app exposes real accessible names, and `getByTestId` (configured to read the app's `data-test` attribute) where it doesn't, no CSS or XPath selectors are used anywhere. Product/order data is never hardcoded: tests capture whatever the UI actually shows (`getDetails()`) and assert that value survives unchanged across pages ("scenario context"), which scales to any catalog size and doesn't need updating if the demo app's content changes. Authenticated state uses a dedicated Playwright `setup` project (not `globalSetup`), the currently-recommended pattern, since it shows up as a real, traceable test run rather than an invisible side effect. CI runs the whole job inside the official `mcr.microsoft.com/playwright` Docker image (pinned to the exact `@playwright/test` version in `package-lock.json`) rather than installing browsers and OS-level dependencies via `apt-get` on a bare Ubuntu runner, after an early run stalled for 13+ minutes on a slow Ubuntu package mirror and had to be cancelled, the container image ships everything pre-baked, so no live package-mirror call happens during a run at all. One notable constraint: TypeScript is pinned to `6.0.3` rather than the newly-released `7.x`, because `typescript-eslint`'s peer range doesn't support TS7 yet, a real ecosystem lag, not a workaround. Finally, the suite intentionally goes beyond the minimum 5-7 scenarios (see Known limitations).

## Known limitations

- **TypeScript is pinned to `6.0.3`**, not the latest `7.x`, because `typescript-eslint` doesn't support TS7 yet at time of writing.
- **The suite has ~28 individual test cases across 4 files**, more than the minimum 5-7 requested. All 5 required categories (happy-path E2E, negative auth, data-driven, reload/storage, intentional known-bug failure) are present, but the happy path is also parameterized across all 6 catalog products and login across all 6 accepted users, for broader coverage rather than the bare minimum.
- **Tests run against the live public `saucedemo.com`**, there's no test data isolation or mocking, so a result can in principle be affected by the real app's uptime or behavior changing between runs.
- **`BUG-007` and `BUG-010` in `BUGS.md` have no screenshot/recording attachment.** Both were observed directly (a load-time delay, and the absence of a UI control) rather than captured visually.
- **`tests/e2e.spec.ts`'s `BUG-001` test is expected to fail** (`test.fail()`) until the real app bug is fixed. That's intentional, if it ever starts passing, Playwright will flag it as an unexpected pass rather than silently going green.
- **The CI workflow has been exercised on GitHub's actual infrastructure**, not just authored, including the current Docker-container version: after switching to `mcr.microsoft.com/playwright:v1.62.1-noble`, the first run failed because GitHub Actions container jobs override `$HOME` to a directory the image's user doesn't own, which made Firefox refuse to launch (`HOME=/root` fixes this, now set at the job level). With that fix, the workflow ran green on GitHub in 3m12s (install, type-check, lint, tests, HTML report artifact upload), down from the original 4-4.5 minute apt-based version and far from the 13+ minute run that had to be cancelled.
- **The CI job runs inside `mcr.microsoft.com/playwright:v1.62.1-noble`** instead of installing browsers/OS deps via `apt-get` on a bare runner. The image tag must be bumped by hand if `package-lock.json`'s `@playwright/test` version ever changes, otherwise the test runner and the image's bundled browsers can drift out of sync.
- **No mobile viewport or touch-emulation coverage**, only desktop Chromium, Firefox, and WebKit projects are configured.
- **The `playwright/expect-expect` ESLint override only recognizes two exact method names** (`expectDetails`, `expectItemVisible`). A new multi-field POM assertion helper would need to be added to `eslint.config.mjs` too, or it'll surface as a (non-blocking) lint warning.
