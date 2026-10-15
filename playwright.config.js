import { defineConfig, devices } from '@playwright/test';

// Runs against production-mode builds made by e2e/build.mjs (npm run test:e2e):
// "app" talks to an API that each test mocks on the test server's own origin,
// "cross-origin" talks to a synthetic API on a separate origin (4319) and is
// served twice: with vercel.json's policy plus that origin (4321, standing in
// for an approved API) and with vercel.json's policy alone (4322).
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
    { name: 'app', testMatch: /(document-viewing|api-errors)\.spec\.js/, use: { baseURL: 'http://127.0.0.1:4317' } },
    { name: 'cross-origin', testMatch: /cross-origin\.spec\.js/, use: { baseURL: 'http://127.0.0.1:4321' } },
    { name: 'preview-build', testMatch: /preview-build\.spec\.js/, use: { baseURL: 'http://127.0.0.1:4318' } },
  ],
  webServer: [
    { command: 'node e2e/serve.mjs 4317 dist', url: 'http://127.0.0.1:4317/', reuseExistingServer: false },
    { command: 'node e2e/serve.mjs 4318 dist-preview', url: 'http://127.0.0.1:4318/', reuseExistingServer: false },
    { command: 'node e2e/serve.mjs 4321 dist-cross-origin http://127.0.0.1:4319', url: 'http://127.0.0.1:4321/', reuseExistingServer: false },
    { command: 'node e2e/serve.mjs 4322 dist-cross-origin', url: 'http://127.0.0.1:4322/', reuseExistingServer: false },
    { command: 'node e2e/api-stub.mjs 4319 http://127.0.0.1:4321 http://127.0.0.1:4322', url: 'http://127.0.0.1:4319/__requests', reuseExistingServer: false },
    { command: 'node e2e/api-stub.mjs 4320', url: 'http://127.0.0.1:4320/__requests', reuseExistingServer: false },
  ],
});
