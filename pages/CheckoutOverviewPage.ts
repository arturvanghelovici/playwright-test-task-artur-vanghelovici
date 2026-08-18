import { type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';

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
