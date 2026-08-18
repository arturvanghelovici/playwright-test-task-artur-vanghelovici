import { expect, type Locator, type Page } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByText('Products', { exact: true });
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page).toHaveURL('/inventory.html');
    await expect(this.pageTitle).toBeVisible();
  }
}
