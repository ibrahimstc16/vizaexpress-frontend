import { expect, test } from '@playwright/test';
import en from '../src/i18n/en.js';
import pl from '../src/i18n/pl.js';
import tr from '../src/i18n/tr.js';

// What a person sees when the API is in maintenance, has a feature switched
// off, limits requests or cannot be reached. The API is mocked on the test
// server's own origin; nothing leaves the machine.

const APP_ID = '9b1d4c1e-0000-4000-8000-000000000001';
const user = { id: 'u1', email: 'specimen@example.com', fullName: 'Specimen User', isAdmin: false };

// answers: { 'METHOD /path': (route, count) => ... }; count starts at 1.
async function setup(page, answers, { lang = 'en', signedIn = false } = {}) {
  const calls = [];
  await page.addInitScript(
    ({ lang, profile }) => {
      localStorage.setItem('vizaexpress-lang', lang);
      if (profile) {
        localStorage.setItem('token', 'test-token');
        localStorage.setItem('user', JSON.stringify(profile));
      }
      window.__cspViolations = [];
      document.addEventListener('securitypolicyviolation', (e) => window.__cspViolations.push(`${e.violatedDirective} ${e.blockedURI}`));
    },
    { lang, profile: signedIn ? user : null }
  );
  await page.route((url) => url.hostname !== '127.0.0.1', (route) => route.abort());
  await page.route(
    (url) => url.host === '127.0.0.1:4317' && url.pathname.startsWith('/api/'),
    (route) => {
      const request = route.request();
      const key = `${request.method()} ${new URL(request.url()).pathname.replace(/^\/api/, '')}`;
      calls.push(key);
      const answer = answers[key];
      if (answer) return answer(route, calls.filter((c) => c === key).length);
      if (key === 'GET /auth/me') return json(route, { user });
      return json(route, { error: 'Not found' }, 404);
    }
  );
  return calls;
}

function json(route, body, status = 200, headers = {}) {
  return route.fulfill({ status, headers, contentType: 'application/json', body: JSON.stringify(body) });
}

async function noViolations(page) {
  expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
}

async function logIn(page, dict = en) {
  await page.goto('/login');
  await page.getByLabel(dict.auth.email).fill('specimen@example.com');
  await page.getByLabel(dict.auth.password, { exact: true }).fill('specimen-password');
  await page.getByRole('button', { name: dict.auth.login.submit }).click();
}

test('sign-in limited: the page says how long to wait and sends nothing more', async ({ page }) => {
  const calls = await setup(page, {
    'POST /auth/login': (route) => json(route, { error: 'Too many attempts', code: 'RATE_LIMITED' }, 429, { 'Retry-After': '840' }),
  });
  await logIn(page);
  await expect(page.getByText('Too many attempts. Please wait 14 min and try again.')).toBeVisible();
  expect(calls.filter((c) => c === 'POST /auth/login')).toHaveLength(1);
  await noViolations(page);
});

test('registration switched off, in Polish', async ({ page }) => {
  const calls = await setup(
    page,
    { 'POST /auth/register': (route) => json(route, { error: 'This feature is temporarily unavailable', code: 'REGISTRATION_DISABLED' }, 503) },
    { lang: 'pl' }
  );
  await page.goto('/register');
  await page.getByLabel(pl.auth.fullName).fill('Specimen User');
  await page.getByLabel(pl.auth.email).fill('specimen@example.com');
  await page.getByLabel(pl.auth.password, { exact: true }).fill('specimen-password');
  await page.getByRole('button', { name: pl.auth.register.submit }).click();
  await expect(page.getByText(pl.apiErrors.registrationDisabled)).toBeVisible();
  expect(calls.filter((c) => c === 'POST /auth/register')).toHaveLength(1);
  await noViolations(page);
});

test('maintenance, in Turkish, names the support address', async ({ page }) => {
  await setup(
    page,
    { 'GET /applications': (route) => json(route, { error: 'Maintenance', code: 'MAINTENANCE' }, 503, { 'Retry-After': '3600' }) },
    { lang: 'tr', signedIn: true }
  );
  await page.goto('/dashboard');
  await expect(page.getByText(tr.apiErrors.maintenance.replace('{email}', 'contact@vizaexpress.com'))).toBeVisible();
  await noViolations(page);
});

test('payments switched off: the checkout button explains it', async ({ page }) => {
  const application = { id: APP_ID, package_type: 'smart', status: 'created', created_at: '2026-10-01T10:00:00Z' };
  const calls = await setup(
    page,
    {
      [`GET /applications/${APP_ID}`]: (route) => json(route, { application, documents: [] }),
      'POST /payments/create-checkout-session': (route) => json(route, { error: 'Unavailable', code: 'PAYMENTS_DISABLED' }, 503),
    },
    { signedIn: true }
  );
  await page.goto(`/application/${APP_ID}`);
  await page.getByRole('button', { name: 'Pay 1,299 PLN' }).click();
  await expect(page.getByText(en.apiErrors.paymentsDisabled)).toBeVisible();
  expect(page.url()).toContain(`/application/${APP_ID}`);
  expect(calls.filter((c) => c.startsWith('POST'))).toHaveLength(1);
});

test('a dropped connection on a read is retried and the page loads', async ({ page }) => {
  const calls = await setup(
    page,
    { 'GET /applications': (route, count) => (count === 1 ? route.abort('connectionreset') : json(route, { applications: [] })) },
    { signedIn: true }
  );
  await page.goto('/dashboard');
  await expect(page.getByText(en.dashboard.emptyTitle)).toBeVisible();
  expect(calls.filter((c) => c === 'GET /applications')).toHaveLength(2);
  await noViolations(page);
});

test('a read that keeps failing stops after two retries and offers to try again', async ({ page }) => {
  const calls = await setup(page, { 'GET /applications': (route) => route.abort('connectionrefused') }, { signedIn: true });
  await page.goto('/dashboard');
  await expect(page.getByText(en.common.networkError)).toBeVisible();
  await expect(page.getByRole('button', { name: en.common.retry })).toBeVisible();
  expect(calls.filter((c) => c === 'GET /applications')).toHaveLength(3);
});

test('a busy service answer is shown without waiting a minute', async ({ page }) => {
  const calls = await setup(
    page,
    { 'GET /applications': (route) => json(route, { error: 'Busy', code: 'RATE_LIMIT_UNAVAILABLE' }, 503, { 'Retry-After': '60' }) },
    { signedIn: true }
  );
  await page.goto('/dashboard');
  await expect(page.getByText(en.apiErrors.busy)).toBeVisible();
  expect(calls.filter((c) => c === 'GET /applications')).toHaveLength(1);
});

test('an ended session sends the person to sign in again', async ({ page }) => {
  await setup(
    page,
    { 'GET /applications': (route) => json(route, { error: 'Session expired', code: 'INVALID_TOKEN' }, 401) },
    { signedIn: true }
  );
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login\?next=.*expired=1/);
  await expect(page.getByText(en.auth.login.expired)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});
