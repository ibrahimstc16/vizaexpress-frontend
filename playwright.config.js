import { defineConfig, devices } from '@playwright/test';

// Runs against production-mode builds made by e2e/build.mjs (npm run test:e2e):
// "app" talks to an API that each test mocks on the test server's own origin,
// "preview-build" has no API at all. The browser cannot resolve any other host.
export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  reporter: process.env.CI ? [['list'], ['junit', { outputFile: 'reports/e2e-junit.xml' }]] : 'list',
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: { args: ['--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1'] },
  },
  projects: [
    { name: 'app', testMatch: /document-viewing\.spec\.js/, use: { baseURL: 'http://127.0.0.1:4317' } },
    { name: 'preview-build', testMatch: /preview-build\.spec\.js/, use: { baseURL: 'http://127.0.0.1:4318' } },
  ],
  webServer: [
    { command: 'node e2e/serve.mjs 4317 dist', url: 'http://127.0.0.1:4317/', reuseExistingServer: false },
    { command: 'node e2e/serve.mjs 4318 dist-preview', url: 'http://127.0.0.1:4318/', reuseExistingServer: false },
  ],
});
