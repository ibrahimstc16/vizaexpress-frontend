// @vitest-environment node
import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import en from '../i18n/en';
import pl from '../i18n/pl';
import uk from '../i18n/uk';
import tr from '../i18n/tr';
import ru from '../i18n/ru';

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
  const csp = all.find((h) => h.key === 'Content-Security-Policy')?.value || '';
  const directive = (name) => csp.split(';').map((d) => d.trim()).find((d) => d.startsWith(`${name} `)) || '';

  it('sends a Content-Security-Policy on every page', () => {
    expect(directive('default-src')).toBe("default-src 'self'");
    expect(directive('script-src')).toBe("script-src 'self'");
    expect(directive('object-src')).toBe("object-src 'none'");
    expect(directive('frame-src')).toBe("frame-src 'none'");
    expect(directive('frame-ancestors')).toBe("frame-ancestors 'none'");
    expect(directive('base-uri')).toBe("base-uri 'self'");
    expect(directive('img-src')).toContain('blob:');
  });

  it('keeps the other security headers', () => {
    const keys = all.map((h) => h.key);
    expect(keys).toEqual(expect.arrayContaining(['X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy']));
  });
});

describe('translations', () => {
  const keys = (node, prefix = '') =>
    Object.entries(node).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));

  it.each([['pl', pl], ['uk', uk], ['tr', tr], ['ru', ru]])('%s has every application string', (_code, dict) => {
    expect(keys(dict.application).sort()).toEqual(keys(en.application).sort());
  });
});
