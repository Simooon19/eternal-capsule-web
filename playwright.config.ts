import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Eternal Capsule E2E tests
 * Focus: Client-side testing with Chromium priority
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/playwright-results.xml' }],
    ['github'],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot on failure */
    screenshot: 'only-on-failure',

    /* Record video on failure */
    video: 'retain-on-failure',

    /* Global timeout for all actions */
    actionTimeout: 10000,

    /* Ignore HTTPS errors */
    ignoreHTTPSErrors: true,
    
    /* Extra HTTP headers */
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  /* Configure projects for client-side testing - Chromium priority */
  projects: [
    // PRIMARY: Chromium (main client-side testing)
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Client-side specific settings
        contextOptions: {
          // Enable JS and ensure client-side execution
          javaScriptEnabled: true,
        }
      },
      testMatch: ['**/*.spec.ts', '**/*.test.ts'],
    },

    // SECONDARY: Client-side responsive testing
    {
      name: 'chromium-mobile',
      use: { 
        ...devices['Pixel 5'],
        contextOptions: {
          javaScriptEnabled: true,
        }
      },
      testMatch: ['**/responsive/*.spec.ts', '**/mobile/*.spec.ts'],
    },

    // VERIFICATION: Cross-browser (run after Chromium passes)
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        contextOptions: {
          javaScriptEnabled: true,
        }
      },
      testMatch: ['**/critical/*.spec.ts'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        contextOptions: {
          javaScriptEnabled: true,
        }
      },
      testMatch: ['**/critical/*.spec.ts'],
    },
  ],

  /* Run development server for E2E tests */
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  /* Test timeout - client-side apps may need more time */
  timeout: 45000,
  expect: {
    /* Timeout for expect() assertions */
    timeout: 10000,
  },

  /* Output directory for test artifacts */
  outputDir: 'test-results/',
}); 