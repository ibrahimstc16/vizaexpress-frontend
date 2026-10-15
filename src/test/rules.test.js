// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../i18n/en';
import pl from '../i18n/pl';
import uk from '../i18n/uk';
import tr from '../i18n/tr';
import ru from '../i18n/ru';
import { cspProblems, parseCsp } from '../../scripts/check-csp.mjs';

const srcDir = new URL('../', import.meta.url);
const sources = readdirSync(srcDir, { recursive: true })
  .filter((name) => /\.(js|jsx)$/.test(name) && !/\.test\.(js|jsx)$/.test(name) && !name.startsWith('test'))
  .map((name) => ({ name, text: readFileSync(new URL(name, srcDir), 'utf8') }));

describe('source rules (F5)', () => {
  it('finds the source files', () => {
    expect(sources.some((s) => s.name.includes('DocumentPreview'))).toBe(true);
  });

  it.each([
    ['dangerouslySetInnerHTML', /dangerouslySetInnerHTML/],
    ['window.open', /window\.open\s*\(/],
    ['embedded frames or plugins', /<(iframe|object|embed|frame)\b/i],
    ['navigating to a file URL', /location(\.href)?\s*=\s*url\b/],
  ])('no %s in src', (_label, pattern) => {
    expect(sources.filter((s) => pattern.test(s.text)).map((s) => s.name)).toEqual([]);
  });
});

describe('vercel.json (F7)', () => {
  const config = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
  const all = config.headers.find((h) => h.source === '/(.*)').headers;

  it('sends a Content-Security-Policy that matches the API environments', () => {
    expect(cspProblems(config)).toEqual([]);
    const csp = parseCsp(all.find((h) => h.key === 'Content-Security-Policy').value);
    expect(csp['img-src']).toContain('blob:');
    expect(csp['connect-src']).not.toContain('https://vizaexpress-backend-production.up.railway.app');
  });

  it('flags a policy that drifts from the API environments', () => {
    const drifted = JSON.parse(JSON.stringify(config).replace("connect-src 'self'", "connect-src 'self' https://other.example.com"));
    expect(cspProblems(drifted).join()).toMatch(/connect-src should be/);
    const scripted = JSON.parse(JSON.stringify(config).replace("script-src 'self'", "script-src 'self' 'unsafe-inline'"));
    expect(cspProblems(scripted).length).toBeGreaterThan(0);
    const styled = JSON.parse(JSON.stringify(config).replace("style-src 'self'", "style-src 'self' 'unsafe-inline'"));
    expect(cspProblems(styled).join()).toMatch(/style-src must not allow inline/);
    const untyped = JSON.parse(JSON.stringify(config).replace("; require-trusted-types-for 'script'", ''));
    expect(cspProblems(untyped).join()).toMatch(/require-trusted-types-for/);
  });

  it('keeps the other security headers', () => {
    const keys = all.map((h) => h.key);
    expect(keys).toEqual(expect.arrayContaining(['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy']));
  });
});

describe('translations', () => {
  const keys = (node, prefix = '') =>
    Object.entries(node).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

  const value = (dict, key) => key.split('.').reduce((node, part) => node[part], dict);
  const placeholders = (text) => (typeof text === 'string' ? (text.match(/\{\w+\}/g) || []).sort() : []);
  const others = [['pl', pl], ['uk', uk], ['tr', tr], ['ru', ru]];

  it.each(others)('%s has every string', (_code, dict) => {
    expect(keys(dict).sort()).toEqual(keys(en).sort());
  });

  it.each(others)('%s keeps every placeholder', (_code, dict) => {
    const differ = keys(en).filter((key) => placeholders(value(dict, key)).join() !== placeholders(value(en, key)).join());
    expect(differ).toEqual([]);
  });

  it.each([['en', en], ...others])('%s explains every answer code of the API', (_code, dict) => {
    for (const key of ['timeout', 'rateLimited', 'rateLimitedNoTime', 'busy', 'maintenance', 'registrationDisabled', 'paymentsDisabled', 'sessionExpired', 'forbidden', 'unavailable']) {
      expect(dict.apiErrors[key], key).toMatch(/\S/);
    }
    expect(dict.apiErrors.rateLimited).toContain('{minutes}');
    expect(dict.apiErrors.maintenance).toContain('{email}');
  });
});
