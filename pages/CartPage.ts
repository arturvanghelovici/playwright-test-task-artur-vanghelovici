import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import { CatalogLineItem, type ProductDetails } from '../components/CatalogLineItem';

export class CartPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
  }

  /** Scopes a line item by matching its name text. */
  item(productName: string): CatalogLineItem {
    const container = this.page.getByTestId('inventory-item').filter({ hasText: productName });
    return new CatalogLineItem(container);
  }

  async checkout(): Promise<void> {
    try {
      await this.checkoutButton.click();
    } catch (error) {
      throw new Error('Failed to proceed to checkout from the cart page', { cause: error });
    }
  }

  async expectItemVisible(expected: ProductDetails): Promise<void> {
    const line = this.item(expected.name);
    await expect(line.name).toHaveText(expected.name);
    await expect(line.description).toHaveText(expected.description);
    await expect(line.price).toHaveText(expected.price);
  }
}
