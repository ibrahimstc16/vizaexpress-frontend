import { expect, test } from '@playwright/test';
import { parseCsp } from '../deploy/csp.js';

// The page and its API on two different origins, under both policies a
// deployed page gets: vercel.json's (sent as a header by e2e/serve.mjs) and
// the build's own (a meta tag). Synthetic data only; the API is
// e2e/api-stub.mjs on 127.0.0.1:4319, and nothing else is reachable.
const API = 'http://127.0.0.1:4319';
const UNAPPROVED = 'http://127.0.0.1:4320';
const RETIRED = 'https://vizaexpress-backend-production.up.railway.app';

test.describe.configure({ mode: 'serial' });

async function received(server, origin) {
  const all = await (await fetch(`${server}/__requests`)).json();
  return all.filter((r) => r.origin === origin).map((r) => `${r.method} ${r.path}`);
}

async function watch(page) {
  await page.addInitScript(() => {
    localStorage.setItem('vizaexpress-lang', 'en');
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (e) => {
      const policy = e.originalPolicy.startsWith('connect-src') ? 'build' : 'site';
      window.__cspViolations.push({ directive: e.effectiveDirective, blocked: e.blockedURI, policy });
    });
  });
}

const violations = (page) => page.evaluate(() => window.__cspViolations);
// "<policy> <directive> <origin>", where policy is "site" (vercel.json header)
// or "build" (the meta tag), sorted.
const blockedBy = async (page) =>
  (await violations(page)).map((v) => `${v.policy} ${v.directive} ${new URL(v.blocked).origin}`).sort();

async function signIn(page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill('specimen@example.com');
  await page.getByLabel('Password', { exact: true }).fill('specimen-password');
  await page.getByRole('button', { name: 'Log in' }).click();
}

test('signs in and loads the dashboard from an API on another origin with no policy violation', async ({ page }) => {
  await watch(page);
  const response = await page.goto('/login');
  const header = parseCsp(response.headers()['content-security-policy']);
  expect(header['connect-src']).toEqual(["'self'", API]);
  const meta = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(meta).toBe(`connect-src 'self' ${API}`);

  await signIn(page);
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect.poll(() => received(API, 'http://127.0.0.1:4321')).toEqual(
    expect.arrayContaining(['POST /api/auth/login', 'GET /api/applications'])
  );
  expect(await violations(page)).toEqual([]);
});

test('the retired API host and an unapproved origin are blocked before any request is sent', async ({ page }) => {
  await watch(page);
  await page.goto('/login');
  const results = await page.evaluate(async (urls) => {
    const out = {};
    for (const [name, url] of Object.entries(urls)) {
      out[name] = await fetch(url).then((r) => `status ${r.status}`, () => 'blocked');
    }
    return out;
  }, { approved: `${API}/api/applications`, unapproved: `${UNAPPROVED}/api/applications`, retired: `${RETIRED}/api/health` });

  expect(results).toEqual({ approved: 'status 200', unapproved: 'blocked', retired: 'blocked' });
  // Each is refused by both policies.
  expect(await blockedBy(page)).toEqual([
    `build connect-src ${UNAPPROVED}`,
    `build connect-src ${RETIRED}`,
    `site connect-src ${UNAPPROVED}`,
    `site connect-src ${RETIRED}`,
  ].sort());
  expect(await (await fetch(`${UNAPPROVED}/__requests`)).json()).toEqual([]);
});

test('when vercel.json does not list the API, the browser blocks it although the build allows it', async ({ page }) => {
  // Same build, served with vercel.json's policy alone. This is what
  // vite.config.js prevents for deployed builds.
  await watch(page);
  const response = await page.goto('http://127.0.0.1:4322/login');
  expect(parseCsp(response.headers()['content-security-policy'])['connect-src']).toEqual(["'self'"]);
  expect(await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')).toBe(`connect-src 'self' ${API}`);

  await page.getByLabel('Email').fill('specimen@example.com');
  await page.getByLabel('Password', { exact: true }).fill('specimen-password');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page.getByText('We could not reach the server.')).toBeVisible();
  expect(await blockedBy(page)).toEqual([`site connect-src ${API}`]);
  expect(await received(API, 'http://127.0.0.1:4322')).toEqual([]);
});
