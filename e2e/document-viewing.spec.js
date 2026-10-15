import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

// Synthetic files only. The API is mocked; nothing leaves the machine.
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
const PDF = Buffer.from('%PDF-1.7\n1 0 obj << /Type /Catalog >> endobj\n%%EOF\n');
const HTML = Buffer.from('<!doctype html><script>window.specimenRan = true</script>');

const APP_ID = '9b1d4c1e-0000-4000-8000-000000000001';
const application = { id: APP_ID, package_type: 'smart', status: 'paid', created_at: '2026-10-01T10:00:00Z' };

function doc(type, n) {
  return {
    id: `9b1d4c1e-0000-4000-8000-00000000000${n}`,
    application_id: APP_ID,
    document_type: type,
    original_filename: `specimen-${type}`,
    ai_validation_status: 'passed',
    ai_validation_result: { passed: true, score: 90, summary: 'Looks good', issues: [], recommendations: [] },
    created_at: '2026-10-01T10:00:00Z',
  };
}

const photo = doc('photo', 2);
const passport = doc('passport', 3);
const address = doc('residence_proof', 4); // bytes are HTML, server type says PNG
const insurance = doc('insurance', 5); // bytes are HTML, server type says HTML
const documents = [photo, passport, address, insurance];
const FILES = {
  [photo.id]: { contentType: 'image/png', body: PNG },
  [passport.id]: { contentType: 'application/pdf', body: PDF },
  [address.id]: { contentType: 'image/png', body: HTML },
  [insurance.id]: { contentType: 'text/html', body: HTML },
};

async function setup(page, { admin = false } = {}) {
  const user = { id: 'u1', email: 'specimen@example.com', fullName: 'Specimen User', isAdmin: admin };
  const calls = [];

  await page.addInitScript((profile) => {
    localStorage.setItem('token', 'test-token');
    localStorage.setItem('user', JSON.stringify(profile));
    localStorage.setItem('vizaexpress-lang', 'en');
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      window.__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`);
    });
  }, user);

  // This build's API is /api on the test server itself (see e2e/build.mjs);
  // every request to it is answered here. Any other host is refused.
  await page.route((url) => url.hostname !== '127.0.0.1', (route) => route.abort());
  await page.route(
    (url) => url.host === '127.0.0.1:4317' && url.pathname.startsWith('/api/'),
    (route) => {
      const request = route.request();
      const path = new URL(request.url()).pathname.replace(/^\/api/, '');
      calls.push(`${request.method()} ${path}`);
      const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

      if (path === '/auth/me') return json({ user });
      if (path === '/applications') return json({ applications: [application] });
      if (path === `/applications/${APP_ID}`) return json({ application, documents });
      if (path === `/admin/applications/${APP_ID}`) {
        return json({ application: { ...application, full_name: 'Specimen User', email: 'specimen@example.com' }, documents });
      }
      const file = path.match(/^\/documents\/([^/]+)\/file$/);
      if (file && FILES[file[1]]) {
        const { contentType, body } = FILES[file[1]];
        return route.fulfill({
          status: 200,
          headers: { 'Content-Disposition': 'attachment', 'X-Content-Type-Options': 'nosniff' },
          contentType,
          body,
        });
      }
      return json({ error: 'Not found' }, 404);
    }
  );

  return calls;
}

function customerCard(page, name) {
  return page.locator('.overflow-hidden', { has: page.getByRole('heading', { name, exact: true }) });
}

function adminCard(page, name) {
  return page.locator('.p-5', { has: page.getByRole('heading', { name, exact: true }) });
}

async function expectStillHere(page, url) {
  expect(page.url()).toBe(url);
  expect(page.context().pages()).toHaveLength(1);
  expect(await page.evaluate(() => window.specimenRan)).toBeUndefined();
}

test('a photo is previewed inside the page', async ({ page }) => {
  await setup(page);
  await page.goto(`/application/${APP_ID}`);
  const url = page.url();

  await customerCard(page, 'Biometric photo').getByRole('button', { name: 'View' }).click();
  const img = page.getByRole('dialog').getByRole('img', { name: 'Biometric photo' });
  await expect(img).toHaveAttribute('src', /^blob:/);
  await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBe(1);
  await expectStillHere(page, url);
});

test('a PDF is offered only as a download', async ({ page }) => {
  await setup(page);
  await page.goto(`/application/${APP_ID}`);
  const url = page.url();

  await customerCard(page, 'Passport').getByRole('button', { name: 'View' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText(/preview is shown for photos only/i)).toBeVisible();
  await expect(page.locator('iframe, object, embed')).toHaveCount(0);

  const [download] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('link', { name: 'Download' }).click()]);
  expect(download.suggestedFilename()).toBe(`passport-${passport.id}.pdf`);
  expect(await readFile(await download.path())).toEqual(PDF);
  await expectStillHere(page, url);
});

for (const [name, item] of [['Proof of address', address], ['Health insurance', insurance]]) {
  test(`HTML stored as "${name}" is never opened`, async ({ page }) => {
    await setup(page);
    await page.goto(`/application/${APP_ID}`);
    const url = page.url();

    await customerCard(page, name).getByRole('button', { name: 'View' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/preview is shown for photos only/i)).toBeVisible();
    await expect(dialog.getByRole('img')).toHaveCount(0);

    const [download] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('link', { name: 'Download' }).click()]);
    expect(download.suggestedFilename()).toBe(`${item.document_type}-${item.id}.bin`);
    await page.waitForTimeout(300);
    await expectStillHere(page, url);
  });
}

test('admin view of an HTML file is a download, and photos still preview (F6)', async ({ page }) => {
  await setup(page, { admin: true });
  await page.goto(`/admin/application/${APP_ID}`);
  const url = page.url();

  await adminCard(page, 'Adres belgesi').getByRole('button', { name: 'Görüntüle' }).click();
  let dialog = page.getByRole('dialog');
  await expect(dialog.getByText(/preview is shown for photos only/i)).toBeVisible();
  await expect(dialog.getByRole('img')).toHaveCount(0);
  const [download] = await Promise.all([page.waitForEvent('download'), dialog.getByRole('link', { name: 'Download' }).click()]);
  expect(download.suggestedFilename()).toMatch(/\.bin$/);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await adminCard(page, 'Biyometrik fotoğraf').getByRole('button', { name: 'Görüntüle' }).click();
  dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('img')).toHaveAttribute('src', /^blob:/);
  await page.waitForTimeout(300);
  await expectStillHere(page, url);
});

test('a file that is not really an image is stopped before upload', async ({ page }) => {
  const calls = await setup(page);
  await page.goto(`/application/${APP_ID}`);

  const card = customerCard(page, 'Work contract');
  await card.locator('input[type=file]').setInputFiles({ name: 'contract.png', mimeType: 'image/png', buffer: HTML });
  await expect(card.getByText('Only JPG, PNG, WebP and PDF files are accepted.')).toBeVisible();
  expect(calls.filter((c) => c.startsWith('POST'))).toEqual([]);
});

test('pages work under the Content-Security-Policy', async ({ page }) => {
  await setup(page);
  const response = await page.goto('/');
  const csp = response.headers()['content-security-policy'];
  expect(csp).toContain("script-src 'self'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("connect-src 'self';");
  expect(csp).toContain("require-trusted-types-for 'script'; trusted-types 'none'");
  expect(csp).not.toContain('unsafe-inline');
  // The build narrows connect-src to its own API.
  expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')).toBe("connect-src 'self' http://127.0.0.1:4317");

  for (const path of ['/', '/pricing', '/login', '/dashboard', `/application/${APP_ID}`]) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('#root')).not.toBeEmpty();
    expect(await page.evaluate(() => window.__cspViolations), path).toEqual([]);
  }

  await customerCard(page, 'Biometric photo').getByRole('button', { name: 'View' }).click();
  await expect(page.getByRole('dialog').getByRole('img')).toHaveAttribute('src', /^blob:/);
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
});
