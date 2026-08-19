import { type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';
import { CatalogLineItem } from '../components/CatalogLineItem';

/**
 * A single product card on the Products page, scoped to a given container
 * (either "the card whose name matches this text" or "the card at this
 * index"), so tests never have to hardcode a specific product's catalog data.
 *
 * Locator strategy: the "Add to cart"/"Remove" buttons share the same
 * accessible name across every card, so each card's controls are scoped to
 * its own `[data-test="inventory-item"]` container rather than relying on the
 * per-product `data-test` slug (e.g. `add-to-cart-sauce-labs-backpack`),
 * which would have to reproduce the app's slugify logic and is more brittle
 * than scoping by container.
 */
class ProductCard extends CatalogLineItem {
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  private readonly label: string;

  constructor(container: Locator, label: string) {
    super(container);
    this.label = label;
    this.addToCartButton = container.getByRole('button', { name: 'Add to cart' });
    this.removeButton = container.getByRole('button', { name: 'Remove' });
  }

  async open(): Promise<void> {
    try {
      await this.name.click();
    } catch (error) {
      throw new Error(`Failed to open product "${this.label}"`, { cause: error });
    }
  }

  async addToCart(): Promise<void> {
    try {
      await this.addToCartButton.click();
    } catch (error) {
      throw new Error(`Failed to add "${this.label}" to cart`, { cause: error });
    }
  }
}

export class ProductsPage {
  readonly page: Page;
  readonly header: HeaderComponent;
  readonly pageTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.pageTitle = page.getByText('Products', { exact: true });
  }

  /** Scopes a card by matching its name text. */
  product(productName: string): ProductCard {
    const container = this.page.getByTestId('inventory-item').filter({ hasText: productName });
    return new ProductCard(container, productName);
  }

  /** Scopes a card by its position, so tests don't need to know any product's name up front. */
  productAt(index: number): ProductCard {
    const container = this.page.getByTestId('inventory-item').nth(index);
    return new ProductCard(container, `product at index ${index}`);
  }

  async addToCart(productName: string): Promise<void> {
    await this.product(productName).addToCart();
  }

  async openProduct(productName: string): Promise<void> {
    await this.product(productName).open();
  }
}
