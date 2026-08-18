import { expect, test } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutOverviewPage } from '../pages/CheckoutOverviewPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { STANDARD_USER_STORAGE_STATE_PATH } from '../data/auth';
import { Route } from '../data/routes';

// Starts already logged in as standard_user via the storageState saved by
// tests/auth.setup.ts, no UI login is repeated per test.
test.use({ storageState: STANDARD_USER_STORAGE_STATE_PATH });

// The catalog has 6 products; running the happy path once per index (rather
// than hardcoding one product's name) exercises every product's own
// name/description/price through the full flow.
const PRODUCT_INDICES = [0, 1, 2, 3, 4, 5] as const;

test.describe('End-to-end', () => {
  for (const index of PRODUCT_INDICES) {
    test(`happy path: login → cart → checkout → order confirmation with product at index ${index}`, async ({
      page,
    }) => {
      const productsPage = new ProductsPage(page);
      await page.goto(Route.Products);
      const product = await productsPage.productAt(index).getDetails();

      await productsPage.addToCart(product.name);
      await productsPage.header.openCart();
      await page.waitForURL(Route.Cart);
      const cartPage = new CartPage(page);
      await cartPage.expectItemVisible(product);

      await cartPage.checkout();
      await page.waitForURL(Route.CheckoutInfo);
      const checkoutPage = new CheckoutPage(page);
      await checkoutPage.fillInfo('John', 'Doe', '12345');
      await checkoutPage.continueCheckout();

      await page.waitForURL(Route.CheckoutOverview);
      const checkoutOverviewPage = new CheckoutOverviewPage(page);
      // Same product, same name/description/price, carried through to Step 2.
      await checkoutOverviewPage.expectItemVisible(product);

      await checkoutOverviewPage.finish();

      await page.waitForURL(Route.CheckoutComplete);
      const checkoutCompletePage = new CheckoutCompletePage(page);
      await expect(checkoutCompletePage.completeHeader).toHaveText('Thank you for your order!');
    });
  }

  // BUG-001 (BUGS.md): checkout completes and creates an order even with 0
  // items in the cart, the Overview page shows an Item total/Tax/Total of 0
  // with no line items, and clicking Finish still lands on "Checkout:
  // Complete!". This test encodes the CORRECT expected behavior (an empty
  // cart should never reach the order-confirmation page), so it is expected
  // to FAIL against the current app until BUG-001 is fixed.
  test('BUG-001: checkout should not complete an order for an empty cart', async ({ page }) => {
    // Marks this as a known, expected failure rather than a red build: if
    // BUG-001 ever gets fixed, Playwright reports this as an unexpected pass
    // instead of silently staying green.
    test.fail();

    await page.goto(Route.Cart);
    const cartPage = new CartPage(page);

    await cartPage.checkout();
    await page.waitForURL(Route.CheckoutInfo);

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.fillInfo('John', 'Doe', '12345');
    await checkoutPage.continueCheckout();
    await page.waitForURL(Route.CheckoutOverview);

    const checkoutOverviewPage = new CheckoutOverviewPage(page);
    await checkoutOverviewPage.finish();

    // Expected: an empty-cart checkout should never reach the confirmation
    // page. Actual (the bug): it does.
    await expect(page).not.toHaveURL(Route.CheckoutComplete);
  });
});
