import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import type { ProductDetails } from '../components/CatalogLineItem';

/**
 * Page object for a single product's detail page (`/inventory-item.html?id=...`),
 * reached by clicking a product name/image on the Products page.
 */
export class ProductDetailPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly backToProductsButton: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.backToProductsButton = page.getByRole('button', { name: 'Back to products' });
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' });
    this.removeButton = page.getByRole('button', { name: 'Remove' });
  }

  async addToCart(): Promise<void> {
    try {
      await this.addToCartButton.click();
    } catch (error) {
      throw new Error('Failed to add product to cart from the detail page', { cause: error });
    }
  }

  async removeFromCart(): Promise<void> {
    try {
      await this.removeButton.click();
    } catch (error) {
      throw new Error('Failed to remove product from cart on the detail page', { cause: error });
    }
  }

  async goBackToProducts(): Promise<void> {
    try {
      await this.backToProductsButton.click();
    } catch (error) {
      throw new Error('Failed to navigate back to products from the detail page', { cause: error });
    }
  }

  async expectDetails(expected: ProductDetails): Promise<void> {
    await expect(this.name).toHaveText(expected.name);
    await expect(this.description).toHaveText(expected.description);
    await expect(this.price).toHaveText(expected.price);
  }
}
