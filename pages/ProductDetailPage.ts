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
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.name = page.getByTestId('inventory-item-name');
    this.description = page.getByTestId('inventory-item-desc');
    this.price = page.getByTestId('inventory-item-price');
  }

  async expectDetails(expected: ProductDetails): Promise<void> {
    await expect(this.name).toHaveText(expected.name);
    await expect(this.description).toHaveText(expected.description);
    await expect(this.price).toHaveText(expected.price);
  }
}
