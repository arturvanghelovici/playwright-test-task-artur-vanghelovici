import { expect, type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import { CatalogLineItem, type ProductDetails } from '../components/CatalogLineItem';

/** Page object for the "Checkout: Overview" step (`/checkout-step-two.html`). */
export class CheckoutOverviewPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly finishButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.finishButton = page.getByRole('button', { name: 'Finish' });
  }

  /** Scopes a line item by matching its name text. */
  item(productName: string): CatalogLineItem {
    const container = this.page.getByTestId('inventory-item').filter({ hasText: productName });
    return new CatalogLineItem(container);
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
}
