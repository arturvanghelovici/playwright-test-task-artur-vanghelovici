import { test } from '@playwright/test';
import { ProductsPage } from '../pages/ProductsPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { STANDARD_USER_STORAGE_STATE_PATH } from '../data/auth';
import { Route } from '../data/routes';

// Starts already logged in as standard_user via the storageState saved by
// global-setup.ts, no UI login is repeated per test.
test.use({ storageState: STANDARD_USER_STORAGE_STATE_PATH });

test.describe('Cart', () => {
  let productsPage: ProductsPage;

  test.beforeEach(async ({ page }) => {
    productsPage = new ProductsPage(page);
    await page.goto(Route.Products);
  });

  test('adding a product from the Products page updates the cart badge', async () => {
    const product = await productsPage.productAt(0).getDetails();

    await productsPage.addToCart(product.name);

    await productsPage.header.expectCartCount(1);
  });

  test('removing a product from the Products page leaves the cart showing no items', async () => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.addToCart(product.name);
    await productsPage.header.expectCartCount(1);

    await productsPage.removeFromCart(product.name);

    await productsPage.header.expectCartCount(0);
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

  test('adding a product from the detail page updates the cart badge', async ({ page }) => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.openProduct(product.name);
    await page.waitForURL(Route.ProductDetailPattern);
    const productDetailPage = new ProductDetailPage(page);

    await productDetailPage.addToCart();

    await productDetailPage.header.expectCartCount(1);
  });

  test('removing a product from the detail page leaves the cart showing no items', async ({
    page,
  }) => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.openProduct(product.name);
    await page.waitForURL(Route.ProductDetailPattern);
    const productDetailPage = new ProductDetailPage(page);
    await productDetailPage.addToCart();
    await productDetailPage.header.expectCartCount(1);

    await productDetailPage.removeFromCart();

    await productDetailPage.header.expectCartCount(0);
  });

  test('cart page shows the item added from the Products page with matching details', async ({
    page,
  }) => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.addToCart(product.name);
    await productsPage.header.openCart();
    await page.waitForURL(Route.Cart);

    const cartPage = new CartPage(page);
    await cartPage.expectItemVisible(product);
  });

  test('removing a product from the Cart page leaves the cart showing no items', async ({
    page,
  }) => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.addToCart(product.name);
    await productsPage.header.openCart();
    await page.waitForURL(Route.Cart);
    const cartPage = new CartPage(page);

    await cartPage.removeItem(product.name);

    await cartPage.header.expectCartCount(0);
  });

  test('going back to products from the detail page returns to the Products page', async ({
    page,
  }) => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.openProduct(product.name);
    await page.waitForURL(Route.ProductDetailPattern);
    const productDetailPage = new ProductDetailPage(page);

    await productDetailPage.goBackToProducts();

    await page.waitForURL(Route.Products);
    await productsPage.pageTitleIsVisible();
  });

  test('continuing shopping from the Cart page returns to the Products page', async ({ page }) => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.addToCart(product.name);
    await productsPage.header.openCart();
    await page.waitForURL(Route.Cart);
    const cartPage = new CartPage(page);

    await cartPage.continueShopping();

    await page.waitForURL(Route.Products);
    await productsPage.pageTitleIsVisible();
  });

  test('checking out from the Cart page navigates to the checkout info page', async ({ page }) => {
    const product = await productsPage.productAt(0).getDetails();
    await productsPage.addToCart(product.name);
    await productsPage.header.openCart();
    await page.waitForURL(Route.Cart);
    const cartPage = new CartPage(page);

    await cartPage.checkout();

    await page.waitForURL(Route.CheckoutInfo);
  });
});
