import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { SAUCE_DEMO_PASSWORD, SauceDemoUser } from '../data/users';
import { Route } from '../data/routes';

// All accepted usernames except `locked_out_user`, which is rejected at login
// (covered separately below) rather than landing on the Products page.
const USERS_WITH_SUCCESSFUL_LOGIN = [
  SauceDemoUser.Standard,
  SauceDemoUser.Problem,
  SauceDemoUser.PerformanceGlitch,
  SauceDemoUser.Error,
  SauceDemoUser.Visual,
] as const;

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  for (const username of USERS_WITH_SUCCESSFUL_LOGIN) {
    test(`${username} can log in and lands on the Products page`, async ({ page }) => {
      const productsPage = new ProductsPage(page);

      await loginPage.fillLogin(username, SAUCE_DEMO_PASSWORD);
      await loginPage.submitLogin();
      await page.waitForURL(Route.Products);

      await expect(productsPage.pageTitle).toBeVisible();
    });
  }

  test('locked_out_user is rejected with an error and stays on the login page', async () => {
    await loginPage.fillLogin(SauceDemoUser.LockedOut, SAUCE_DEMO_PASSWORD);
    await loginPage.submitLogin();

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      'Epic sadface: Sorry, this user has been locked out.',
    );
  });
});
