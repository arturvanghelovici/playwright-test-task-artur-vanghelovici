import { type Locator, type Page } from '@playwright/test';
import { HeaderComponent } from '../components/HeaderComponent';

export interface ProductDetails {
  name: string;
  description: string;
  price: string;
}

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
class ProductCard {
  readonly container: Locator;
  readonly name: Locator;
  readonly description: Locator;
  readonly price: Locator;
  readonly addToCartButton: Locator;
  readonly removeButton: Locator;
  private readonly label: string;

  constructor(container: Locator, label: string) {
    this.container = container;
    this.label = label;
    this.name = container.getByTestId('inventory-item-name');
    this.description = container.getByTestId('inventory-item-desc');
    this.price = container.getByTestId('inventory-item-price');
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

  async remove(): Promise<void> {
    try {
      await this.removeButton.click();
    } catch (error) {
      throw new Error(`Failed to remove "${this.label}" from cart`, { cause: error });
    }
  }

  /** Reads this card's catalog data straight from the page instead of relying on hardcoded fixtures. */
  async getDetails(): Promise<ProductDetails> {
    const [name, description, price] = await Promise.all([
      this.name.innerText(),
      this.description.innerText(),
      this.price.innerText(),
    ]);
    return { name, description, price };
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

  async removeFromCart(productName: string): Promise<void> {
    await this.product(productName).remove();
  }

  async openProduct(productName: string): Promise<void> {
    await this.product(productName).open();
  }
}
