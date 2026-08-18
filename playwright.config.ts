import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Retries are CI-only: a flaky retry masking a real bug locally is worse
  // than a fast, deterministic failure while iterating.
  retries: process.env.CI ? 2 : 0,
  // Parallel on both CI and locally; CI just gets a smaller worker count
  // to match typical CI runner resources.
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'https://www.saucedemo.com',
    // Unlike 'on-first-retry', this captures a trace on every failure,
    // including the very first attempt when retries are 0 (e.g. locally).
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // SauceDemo identifies interactive elements via a `data-test` attribute
    // instead of the default `data-testid`, so page objects use `getByTestId`.
    testIdAttribute: 'data-test',
  },

  projects: [
    {
      // Logs in once and saves storageState to disk (see tests/auth.setup.ts)
      // before the browser projects run, so tests that need an authenticated
      // session don't repeat the UI login flow.
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['setup'],
    },
  ],
});
