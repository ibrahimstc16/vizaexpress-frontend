// @vitest-environment node
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { API_ORIGINS, deployedApiOrigins } from '../../deploy/apiEnvironments.js';
import { buildConnectSrc, cspDisagreement, parseCsp, siteCsp, withConnectSources } from '../../deploy/csp.js';

const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
const site = (policy) => ({ headers: [{ source: '/(.*)', headers: [{ key: 'Content-Security-Policy', value: policy }] }] });

describe('the build policy and vercel.json', () => {
  it('the build policy names its own origin and its API', () => {
    expect(buildConnectSrc('https://api.example.com')).toBe("connect-src 'self' https://api.example.com");
    expect(buildConnectSrc(null)).toBe("connect-src 'self'");
  });

  it('agree when vercel.json allows the API', () => {
    expect(cspDisagreement(site("connect-src 'self' https://api.example.com"), 'https://api.example.com')).toBeNull();
    expect(cspDisagreement(site("default-src 'self' https://api.example.com"), 'https://api.example.com')).toBeNull();
    expect(cspDisagreement(site("connect-src 'self'"), null)).toBeNull();
  });

  it('disagree when vercel.json would block the API or has no policy', () => {
    expect(cspDisagreement(site("connect-src 'self'"), 'https://api.example.com')).toMatch(/does not allow https:\/\/api.example.com/);
    expect(cspDisagreement(site("connect-src https://api.example.com"), 'https://api.example.com')).toMatch(/does not allow 'self'/);
    expect(cspDisagreement({ headers: [] }, null)).toMatch(/no Content-Security-Policy/);
  });

  it('the committed vercel.json allows every deployed API origin and nothing else', () => {
    for (const origin of [null, ...deployedApiOrigins(API_ORIGINS)]) expect(cspDisagreement(vercel, origin)).toBeNull();
    expect(parseCsp(siteCsp(vercel))['connect-src']).toEqual(["'self'", ...deployedApiOrigins(API_ORIGINS)]);
    expect(cspDisagreement(vercel, 'https://vizaexpress-backend-production.up.railway.app')).toMatch(/does not allow/);
  });

  it('the browser-test copy adds origins without changing vercel.json', () => {
    const before = JSON.stringify(vercel);
    const copy = withConnectSources(vercel, ['http://127.0.0.1:4319']);
    expect(JSON.stringify(vercel)).toBe(before);
    expect(parseCsp(siteCsp(copy))['connect-src']).toEqual([...parseCsp(siteCsp(vercel))['connect-src'], 'http://127.0.0.1:4319']);
    const { 'connect-src': _a, ...rest } = parseCsp(siteCsp(copy));
    const { 'connect-src': _b, ...original } = parseCsp(siteCsp(vercel));
    expect(rest).toEqual(original);
  });
});
