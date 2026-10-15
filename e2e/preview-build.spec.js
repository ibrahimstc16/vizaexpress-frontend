import { readdirSync, readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// The preview build has no API address (VITE_APP_ENV=preview, no VITE_API_URL).
// It must load, say it is not connected, and never send an API request.

async function watch(page) {
  const requests = [];
  page.on('request', (request) => requests.push(request.url()));
  await page.addInitScript(() => {
    localStorage.setItem('vizaexpress-lang', 'en');
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__cspViolations.push(e.violatedDirective));
  });
  await page.route((url) => url.hostname !== '127.0.0.1', (route) => route.abort());
  // Only the page itself and Google Fonts (blocked above) may be requested.
  return () => requests.filter((url) => !url.startsWith('http://127.0.0.1:4318/') && !/^https:\/\/fonts\.(googleapis|gstatic)\.com\//.test(url));
}

test('login says the build is not connected and sends nothing', async ({ page }) => {
  const unexpected = await watch(page);
  await page.goto('/login');
  expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')).toBe("connect-src 'self'");

  await page.getByLabel('Email').fill('specimen@example.com');
  await page.getByLabel('Password', { exact: true }).fill('specimen-password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('This version of the site is not connected to a server.')).toBeVisible();

  expect(unexpected()).toEqual([]);
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
});

test('a signed-in page sends no API request', async ({ page }) => {
  const unexpected = await watch(page);
  await page.addInitScript(() => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify({ id: 'u1', email: 'specimen@example.com', fullName: 'Specimen User', isAdmin: false }));
  });
  await page.goto('/dashboard');
  await expect(page.getByText('This version of the site is not connected to a server.')).toBeVisible();
  expect(unexpected()).toEqual([]);
});

test('no bundle contains the retired API host', () => {
  for (const dir of ['dist', 'dist-cross-origin', 'dist-preview']) {
    const assets = new URL(`../${dir}/assets/`, import.meta.url);
    for (const name of readdirSync(assets)) {
      expect(readFileSync(new URL(name, assets), 'utf8'), `${dir}/assets/${name}`).not.toContain('up.railway.app');
    }
  }
});
