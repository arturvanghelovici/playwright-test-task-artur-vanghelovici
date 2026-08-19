import { expect, test } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { STANDARD_USER_STORAGE_STATE_PATH } from '../data/auth';
import { Route } from '../data/routes';

// Starts already logged in as standard_user via the storageState saved by
// tests/auth.setup.ts, no UI login is repeated per test.
test.use({ storageState: STANDARD_USER_STORAGE_STATE_PATH });

test.describe('Cart', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await page.goto(Route.Products);
  });

  test('product detail page shows the same name, description, and price as the Products list', async ({
    page,
  }) => {
    const product = await productsPage.productAt(0).getDetails();

    await productsPage.openProduct(product.name);
    await page.waitForURL(Route.ProductDetailPattern);

    const productDetailPage = new ProductDetailPage(page);
    await productDetailPage.expectDetails(product);
  });

  test('cart contents survive a full page reload', async ({ page }) => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.addToCart(product.name);
    await expect(productsPage.header.cartBadge).toHaveText('1');

    await page.reload();

    await expect(productsPage.header.cartBadge).toHaveText('1');
    await expect(productsPage.product(product.name).removeButton).toBeVisible();

    await productsPage.header.openCart();
    await page.waitForURL(Route.Cart);
    const cartPage = new CartPage(page);
    await cartPage.expectItemVisible(product);
  });
});
