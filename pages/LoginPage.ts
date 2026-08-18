import { type Locator, type Page } from '@playwright/test';
import { Route } from '../data/routes';

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByTestId('error');
  }

  async goto(): Promise<void> {
    await this.page.goto(Route.Login);
  }

  async fillLogin(username: string, password: string): Promise<void> {
    try {
      await this.usernameInput.fill(username);
      await this.passwordInput.fill(password);
    } catch (error) {
      throw new Error(`Failed to fill login form for user "${username}"`, { cause: error });
    }
  }

  async submitLogin(): Promise<void> {
    try {
      await this.loginButton.click();
    } catch (error) {
      throw new Error('Failed to submit login form', { cause: error });
    }
  }
}
