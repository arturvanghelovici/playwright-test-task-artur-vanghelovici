import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import type { ProductDetails } from './ProductsPage';

/** A single line item on the Checkout Overview page, scoped to a given container. */
class OverviewLineItem {
  readonly container: Locator;
  readonly quantity: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;

  constructor(container: Locator) {
    this.container = container;
    this.quantity = container.getByTestId('item-quantity');
    this.name = container.getByTestId('inventory-item-name');
    this.description = container.getByTestId('inventory-item-desc');
    this.price = container.getByTestId('inventory-item-price');
  }
}

/** Page object for the "Checkout: Overview" step (`/checkout-step-two.html`). */
export class CheckoutOverviewPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly itemTotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.itemTotal = page.getByTestId('subtotal-label');
    this.tax = page.getByTestId('tax-label');
    this.total = page.getByTestId('total-label');
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
  }

  /** Scopes a line item by matching its name text. */
  item(productName: string): OverviewLineItem {
    const container = this.page.getByTestId('inventory-item').filter({ hasText: productName });
    return new OverviewLineItem(container);
  }

  /** Scopes a line item by its position, so tests don't need to know any product's name up front. */
  itemAt(index: number): OverviewLineItem {
    const container = this.page.getByTestId('inventory-item').nth(index);
    return new OverviewLineItem(container);
  }

  async expectItemVisible(expected: ProductDetails): Promise<void> {
    const line = this.item(expected.name);
    await expect(line.name).toHaveText(expected.name);
    await expect(line.description).toHaveText(expected.description);
    await expect(line.price).toHaveText(expected.price);
  }

  async finish(): Promise<void> {
    try {
      await this.finishButton.click();
    } catch (error) {
      throw new Error('Failed to finish checkout from the overview page', { cause: error });
    }
  }

  async cancel(): Promise<void> {
    try {
      await this.cancelButton.click();
    } catch (error) {
      throw new Error('Failed to cancel from the checkout overview page', { cause: error });
    }
  }
}
