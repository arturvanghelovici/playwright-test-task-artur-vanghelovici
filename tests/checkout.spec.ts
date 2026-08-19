import { expect, test } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { STANDARD_USER_STORAGE_STATE_PATH } from '../data/auth';
import { Route } from '../data/routes';

// Starts already logged in as standard_user via the storageState saved by
// tests/auth.setup.ts, no UI login is repeated per test.
test.use({ storageState: STANDARD_USER_STORAGE_STATE_PATH });

// Each case leaves exactly one field empty, so the info form is exercised
// with the same shape of data for all three required-field validations.
const REQUIRED_FIELD_CASES = [
  {
    field: 'First Name',
    firstName: '',
    lastName: 'Doe',
    postalCode: '12345',
    expectedError: 'Error: First Name is required',
  },
  {
    field: 'Last Name',
    firstName: 'John',
    lastName: '',
    postalCode: '12345',
    expectedError: 'Error: Last Name is required',
  },
  {
    field: 'Postal Code',
    firstName: 'John',
    lastName: 'Doe',
    postalCode: '',
    expectedError: 'Error: Postal Code is required',
  },
] as const;

test.describe('Checkout: Your Information', () => {
  let checkoutPage: CheckoutPage;

  test.beforeEach(async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await page.goto(Route.Products);
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.addToCart(product.name);
    await productsPage.header.openCart();
    await page.waitForURL(Route.Cart);

    const cartPage = new CartPage(page);
    await cartPage.checkout();
    await page.waitForURL(Route.CheckoutInfo);
    checkoutPage = new CheckoutPage(page);
  });

  for (const { field, firstName, lastName, postalCode, expectedError } of REQUIRED_FIELD_CASES) {
    test(`continue is blocked when ${field} is empty`, async ({ page }) => {
      await checkoutPage.fillInfo(firstName, lastName, postalCode);

      await checkoutPage.continueCheckout();

      await expect(checkoutPage.errorMessage).toBeVisible();
      await expect(checkoutPage.errorMessage).toContainText(expectedError);
      await expect(page).toHaveURL(Route.CheckoutInfo);
    });
  }
});
