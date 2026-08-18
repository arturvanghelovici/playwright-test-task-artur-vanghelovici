import { type Locator, type Page } from '@playwright/test';

/**
 * The shopping-cart header shared by the Products, Product detail, Cart, and
 * Checkout pages, so it's factored out rather than duplicated on each page
 * object.
 */
export class HeaderComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async openCart(): Promise<void> {
    try {
      await this.cartLink.click();
    } catch (error) {
      throw new Error('Failed to open the cart from the header', { cause: error });
    }
  }
}
