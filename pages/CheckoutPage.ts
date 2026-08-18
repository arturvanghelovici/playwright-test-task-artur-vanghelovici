import { type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';

/** Page object for the "Checkout: Your Information" step (`/checkout-step-one.html`). */
export class CheckoutPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.firstNameInput = page.getByRole('textbox', { name: 'First Name' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Last Name' });
    this.postalCodeInput = page.getByRole('textbox', { name: 'Zip/Postal Code' });
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
  }

  async fillInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    try {
      await this.firstNameInput.fill(firstName);
      await this.lastNameInput.fill(lastName);
      await this.postalCodeInput.fill(postalCode);
    } catch (error) {
      throw new Error('Failed to fill checkout info form', { cause: error });
    }
  }

  async continueCheckout(): Promise<void> {
    try {
      await this.continueButton.click();
    } catch (error) {
      throw new Error('Failed to continue from the checkout info page', { cause: error });
    }
  }

  async cancel(): Promise<void> {
    try {
      await this.cancelButton.click();
    } catch (error) {
      throw new Error('Failed to cancel from the checkout info page', { cause: error });
    }
  }
}
