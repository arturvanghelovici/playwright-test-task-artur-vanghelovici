import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import { CatalogLineItem, type ProductDetails } from '../components/CatalogLineItem';

/** A single line item on the Cart page, scoped to a given container. */
class CartLineItem extends CatalogLineItem {
  readonly removeButton: Locator;
  private readonly label: string;

  constructor(container: Locator, label: string) {
    super(container);
    this.label = label;
    this.removeButton = container.getByRole('button', { name: 'Remove' });
  }

  async remove(): Promise<void> {
    try {
      await this.removeButton.click();
    } catch (error) {
      throw new Error(`Failed to remove "${this.label}" from the cart page`, { cause: error });
    }
  }
}

export class CartPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.checkoutButton = page.getByRole('button', { name: 'Checkout' });
    this.continueShoppingButton = page.getByRole('button', { name: 'Continue Shopping' });
  }

  /** Scopes a line item by matching its name text. */
  item(productName: string): CartLineItem {
    const container = this.page.getByTestId('inventory-item').filter({ hasText: productName });
    return new CartLineItem(container, productName);
  }

  async removeItem(productName: string): Promise<void> {
    await this.item(productName).remove();
  }

  async checkout(): Promise<void> {
    try {
      await this.checkoutButton.click();
    } catch (error) {
      throw new Error('Failed to proceed to checkout from the cart page', { cause: error });
    }
  }

  async continueShopping(): Promise<void> {
    try {
      await this.continueShoppingButton.click();
    } catch (error) {
      throw new Error('Failed to continue shopping from the cart page', { cause: error });
    }
  }

  async expectItemVisible(expected: ProductDetails): Promise<void> {
    const line = this.item(expected.name);
    await expect(line.name).toHaveText(expected.name);
    await expect(line.description).toHaveText(expected.description);
    await expect(line.price).toHaveText(expected.price);
  }
}
