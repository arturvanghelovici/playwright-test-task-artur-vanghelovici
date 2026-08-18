import { test as setup } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { SAUCE_DEMO_PASSWORD, SauceDemoUser } from '../data/users';
import { STANDARD_USER_STORAGE_STATE_PATH } from '../data/auth';
import { Route } from '../data/routes';

/**
 * Runs once (as the `setup` project, see playwright.config.ts) before the
 * browser projects. Logs in as standard_user and persists the authenticated
 * storageState to disk so tests that need a logged-in session can start from
 * it via `test.use({ storageState: STANDARD_USER_STORAGE_STATE_PATH })` instead of
 * repeating the UI login flow.
 */
// Side-effecting setup (saves storageState), not a behavioral test;
// page.waitForURL already fails the run if login didn't land on Products.
// eslint-disable-next-line playwright/expect-expect
setup('authenticate as standard_user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.fillLogin(SauceDemoUser.Standard, SAUCE_DEMO_PASSWORD);
  await loginPage.submitLogin();
  await page.waitForURL(Route.Products);

  await page.context().storageState({ path: STANDARD_USER_STORAGE_STATE_PATH });
});
