import { type Locator } from '@playwright/test';

export interface ProductDetails {
  name: string;
  description: string;
  price: string;
}

/**
 * Base for any product/line-item row shared across the Products, Cart, and
 * Checkout Overview pages: all three render the same name/description/price
 * triad via the same `data-test` attributes on a `[data-test="inventory-item"]`
 * container. The Checkout Overview page's rows are read-only, so it uses this
 * class directly; Products (`ProductCard`) and Cart (`CartLineItem`) each add
 * their own action controls via a page-specific subclass.
 */
export class CatalogLineItem {
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;

  constructor(container: Locator) {
    this.name = container.getByTestId('inventory-item-name');
    this.description = container.getByTestId('inventory-item-desc');
    this.price = container.getByTestId('inventory-item-price');
  }

  /** Reads this row's catalog data straight from the page instead of relying on hardcoded fixtures. */
  async getDetails(): Promise<ProductDetails> {
    const [name, description, price] = await Promise.all([
      this.name.innerText(),
      this.description.innerText(),
      this.price.innerText(),
    ]);
    return { name, description, price };
  }
}
