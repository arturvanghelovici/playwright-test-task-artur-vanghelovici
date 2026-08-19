import { type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';

/** Page object for the "Checkout: Complete!" confirmation page. */
export class CheckoutCompletePage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.completeHeader = page.getByTestId('complete-header');
  }
}
