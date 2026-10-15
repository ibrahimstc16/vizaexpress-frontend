// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { build, resolveConfig } from 'vite';

// vite.config.js stops a build whose API configuration is missing or unsafe,
// before anything is bundled.
const saved = { ...process.env };

afterEach(() => {
  for (const key of ['VITE_APP_ENV', 'VITE_API_URL', 'VERCEL_ENV']) {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  }
});

async function buildWith(env) {
  for (const key of ['VITE_APP_ENV', 'VITE_API_URL', 'VERCEL_ENV']) delete process.env[key];
  Object.assign(process.env, env);
  return build({ mode: 'production', logLevel: 'silent', build: { write: false } });
}

describe('vite build refuses unsafe API configuration', () => {
  it.each([
    ['a Vercel production build without VITE_API_URL', { VERCEL_ENV: 'production' }, /required for production/],
    ['a build that names no environment', {}, /Set VITE_APP_ENV/],
    ['a preview build pointing at the retired API host', { VERCEL_ENV: 'preview', VITE_API_URL: 'https://vizaexpress-backend-production.up.railway.app/api' }, /retired API host/],
    ['a staging build without VITE_API_URL', { VITE_APP_ENV: 'staging' }, /required for staging/],
  ])('%s', async (_label, env, message) => {
    await expect(buildWith(env)).rejects.toThrow(message);
  });
});

describe('vite build checks vercel.json for deployed builds', () => {
  // Deployed builds stop without vercel.json, so this shows vite.config.js
  // passes it; the checks themselves are in apiEnvironments.test.js.
  it('accepts a preview without an API against the committed vercel.json', async () => {
    for (const key of ['VITE_APP_ENV', 'VITE_API_URL', 'VERCEL_ENV']) delete process.env[key];
    process.env.VERCEL_ENV = 'preview';
    const config = await resolveConfig({ mode: 'production', logLevel: 'silent' }, 'build');
    expect(config.define.__API_URL__).toBe('null');
  });
});
