# playwright-test-task-artur-vanghelovici

Playwright + TypeScript automation suite for [saucedemo.com](https://www.saucedemo.com/). `MANUAL-TESTS.md` and
`BUGS.md` cover the manual QA part of the same task.

## How to install and run (fresh machine)

Requirements: Node.js 22.x and npm. Nothing else, no database, no local server, tests run against the live public site.

```bash
git clone https://github.com/arturvanghelovici/playwright-test-task-artur-vanghelovici.git
cd playwright-test-task-artur-vanghelovici
npm ci
npx playwright install --with-deps
```

Then:

```bash
npm test           # full suite, headless, all three browsers
npm run test:headed
npm run test:ui
npm run test:report
npm run typecheck
npm run lint
npm run format
```

Every one of those commands runs the `setup` project first (`tests/auth.setup.ts`). It logs in once as `standard_user`
and writes the session to `playwright/.auth/`. You don't log in by hand before running tests, that's the point of it.

## Project structure

`tests/` has one spec file per flow, `login.spec.ts`, `cart.spec.ts`, `checkout.spec.ts`, `e2e.spec.ts`, plus
`auth.setup.ts` for the login-once fixture described above. `pages/` has one class per screen: `LoginPage`,
`ProductsPage`, `ProductDetailPage`, `CartPage`, `CheckoutPage`, `CheckoutOverviewPage`, `CheckoutCompletePage`. Two
things are pulled out into `components/` because they're not page-specific: `HeaderComponent.ts` is the cart badge and
cart link that sit on every page, and `CatalogLineItem.ts` is the name/description/price row shape that the Products,
Cart, and Checkout Overview pages all render the same way. `data/` holds the constants tests reach for instead of magic
strings, `routes.ts` (a `Route` enum of URL paths), `users.ts` (the `SauceDemoUser` enum and shared password), `auth.ts`
(the storageState file path). Config sits at the root: `playwright.config.ts`, `eslint.config.mjs`, `tsconfig.json`,
`.prettierrc.json`. CI is `.github/workflows/playwright.yml`.

## Design decisions and trade-offs

Page Object Model, no alternative needed here, the app maps cleanly onto pages and that's enough. Two refinements on top
of plain POM: assertions live in the test body, not in a wrapper method, unless a check spans multiple fields
(`expectDetails`, `expectItemVisible` compare name, description, and price together), in which case collapsing three
`expect()` calls into one named method is worth the indirection. Everything else just uses a locator directly, so a
failing assertion's stack trace points at the actual test line instead of somewhere inside a page object. Locators are
role- or text-based wherever the app exposes a real accessible name (`getByRole`, `getByText`); where it doesn't, the
`data-test` attribute is used via `getByTestId` (`testIdAttribute` is configured for it in `playwright.config.ts`). No
CSS or XPath selectors anywhere.

Product and order data is never hardcoded. Tests read whatever the Products page actually shows (`getDetails()`) and
check that the same value survives the trip through cart, checkout, and confirmation. That's a deliberate choice: it
means the suite doesn't care what the catalog contains, and it doesn't need editing if SauceDemo's product list ever
changes. `CatalogLineItem` came out of this pattern too, `ProductCard`, `CartLineItem`, and the Checkout Overview page's
rows all needed the same name/description/price locators.

Authenticated state is a Playwright `setup` project rather than `globalSetup`. That's the pattern Playwright currently
documents for this, and the practical reason to prefer it is visibility, it runs as a real, named test with its own
entry in the report, instead of a step that happens silently before anything else starts.

CI runs inside `mcr.microsoft.com/playwright:v1.62.1-noble` (pinned to the exact `@playwright/test` version in
`package-lock.json`) rather than provisioning a bare Ubuntu runner with `apt-get install --with-deps` every time. That
wasn't the first approach.

TypeScript is pinned to `6.0.3`, not the current `7.x`. `typescript-eslint`'s peer dependency range doesn't cover TS7
yet, so installing the newest TypeScript would leave the lint step broken. That's an ecosystem-lag constraint, not a
choice.

## Known limitations

- **TypeScript is pinned to `6.0.3`**, one release behind current, because `typescript-eslint` doesn't support TS7 at
  the time of writing. Bump both together once it does.
- **Tests run against the live public `saucedemo.com`.** No mocking, no isolated test data. A result can in principle be
  affected by the real app changing or being unavailable at run time.
- **`tests/e2e.spec.ts`'s `BUG-001` test is expected to fail.** It's marked with `test.fail()` on purpose, it encodes
  the correct behavior (an empty cart shouldn't reach order confirmation) against an app that currently allows it. If
  the underlying bug ever gets fixed, this test starts failing differently, as an unexpected pass, which Playwright will
  flag rather than hide.
- **The Docker image tag in CI is not automatically kept in sync with `package-lock.json`.** If `@playwright/test`'s
  version changes there, the image tag needs a matching manual bump, or the test runner and the image's bundled browsers
  can drift apart.
- Only desktop Chromium, Firefox, and WebKit are configured as projects.
