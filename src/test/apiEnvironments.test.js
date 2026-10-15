// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { API_ORIGINS, ApiConfigError, checkEnvironments, resolveApiConfig } from '../../deploy/apiEnvironments.js';

// Example lists; the real ones are in deploy/apiEnvironments.js.
const origins = {
  production: ['https://api.example.com'],
  staging: ['https://staging-api.example.com'],
  preview: ['https://staging-api.example.com'],
};
// vercel.json's policy as it would be with those lists.
const siteWith = (sources) => ({
  headers: [{ source: '/(.*)', headers: [{ key: 'Content-Security-Policy', value: `default-src 'self'; connect-src ${sources}` }] }],
});
const siteConfig = siteWith("'self' https://api.example.com https://staging-api.example.com");
const resolve = (env, options = {}) => resolveApiConfig(env, { origins, siteConfig, ...options });
const refuses = (env, pattern, options) => expect(() => resolve(env, options)).toThrow(pattern);

describe('production builds', () => {
  it('use the listed production API', () => {
    expect(resolve({ VITE_APP_ENV: 'production', VITE_API_URL: 'https://api.example.com/api/' })).toEqual({
      appEnv: 'production',
      apiUrl: 'https://api.example.com/api',
      apiOrigin: 'https://api.example.com',
    });
  });

  it('are recognised from VERCEL_ENV', () => {
    expect(resolve({ VERCEL_ENV: 'production', VITE_API_URL: 'https://api.example.com/api' }).appEnv).toBe('production');
  });

  it('fail without an API address', () => {
    refuses({ VITE_APP_ENV: 'production' }, /required for production/);
    refuses({ VERCEL_ENV: 'production', VITE_API_URL: '  ' }, /required for production/);
  });

  it('refuse the staging API, plain http and the retired host', () => {
    refuses({ VITE_APP_ENV: 'production', VITE_API_URL: 'https://staging-api.example.com/api' }, /not an allowed API origin/);
    refuses({ VITE_APP_ENV: 'production', VITE_API_URL: 'http://api.example.com/api' }, /not an allowed API origin/);
    refuses({ VITE_APP_ENV: 'production', VITE_API_URL: 'https://vizaexpress-backend-production.up.railway.app/api' }, /retired API host/);
    refuses({ VITE_APP_ENV: 'production', VITE_API_URL: 'https://user:pw@api.example.com/api' }, /credentials/);
    refuses({ VITE_APP_ENV: 'production', VITE_API_URL: 'not a url' }, /not a valid URL/);
  });
});

describe('staging builds', () => {
  it('use the staging API', () => {
    expect(resolve({ VITE_APP_ENV: 'staging', VITE_API_URL: 'https://staging-api.example.com/api' }).apiOrigin).toBe('https://staging-api.example.com');
  });

  it('fail without an API address and refuse the production API', () => {
    refuses({ VITE_APP_ENV: 'staging' }, /required for staging/);
    refuses({ VITE_APP_ENV: 'staging', VITE_API_URL: 'https://api.example.com/api' }, /not an allowed API origin/);
  });
});

describe('preview builds', () => {
  it('run without an API when none is set', () => {
    expect(resolve({ VERCEL_ENV: 'preview' })).toEqual({ appEnv: 'preview', apiUrl: null, apiOrigin: null });
  });

  it('may use the staging API but never the production API or the retired host', () => {
    expect(resolve({ VERCEL_ENV: 'preview', VITE_API_URL: 'https://staging-api.example.com/api' }).apiOrigin).toBe('https://staging-api.example.com');
    refuses({ VERCEL_ENV: 'preview', VITE_API_URL: 'https://api.example.com/api' }, /not an allowed API origin for preview/);
    refuses({ VERCEL_ENV: 'preview', VITE_API_URL: 'https://vizaexpress-backend-production.up.railway.app/api' }, /retired API host/);
  });

  it('cannot be relabelled as production by VERCEL_ENV when VITE_APP_ENV says preview', () => {
    refuses({ VITE_APP_ENV: 'preview', VERCEL_ENV: 'production', VITE_API_URL: 'https://api.example.com/api' }, /preview/);
  });
});

describe('other builds', () => {
  it('need an environment name', () => {
    refuses({ VITE_API_URL: 'https://api.example.com/api' }, /Set VITE_APP_ENV/);
    refuses({ VITE_APP_ENV: 'qa' }, /Unknown VITE_APP_ENV/);
  });

  it('the dev server defaults to development and may run without an API', () => {
    expect(resolve({}, { command: 'serve' })).toEqual({ appEnv: 'development', apiUrl: null, apiOrigin: null });
    expect(resolve({ VITE_API_URL: 'http://localhost:3000/api' }, { command: 'serve' }).apiUrl).toBe('http://localhost:3000/api');
    refuses({ VITE_API_URL: 'https://api.example.com/api' }, /not an allowed API origin for development/, { command: 'serve' });
  });
});

describe('environment lists', () => {
  it('the committed lists follow the rules', () => {
    expect(() => checkEnvironments(API_ORIGINS)).not.toThrow();
  });

  it('reject a production origin shared with another environment', () => {
    expect(() => checkEnvironments({ ...origins, preview: ['https://api.example.com'] })).toThrow(ApiConfigError);
  });

  it('reject plain http, paths and the retired host', () => {
    expect(() => checkEnvironments({ ...origins, staging: ['http://staging-api.example.com'] })).toThrow(/https/);
    expect(() => checkEnvironments({ ...origins, staging: ['https://staging-api.example.com/api'] })).toThrow(/bare origin/);
    expect(() => checkEnvironments({ ...origins, production: ['https://vizaexpress-backend-production.up.railway.app'] })).toThrow(/retired/);
  });
});

describe('vercel.json and the build agree (deploy/csp.js)', () => {
  it('a deployed build cannot be checked without vercel.json', () => {
    refuses({ VITE_APP_ENV: 'production', VITE_API_URL: 'https://api.example.com/api' }, /needs vercel.json/, { siteConfig: undefined });
    refuses({ VERCEL_ENV: 'preview' }, /needs vercel.json/, { siteConfig: undefined });
  });

  it('a deployed build fails when vercel.json does not allow its API', () => {
    refuses(
      { VITE_APP_ENV: 'production', VITE_API_URL: 'https://api.example.com/api' },
      /vercel.json connect-src does not allow https:\/\/api.example.com/,
      { siteConfig: siteWith("'self' https://staging-api.example.com") }
    );
    refuses({ VITE_APP_ENV: 'staging', VITE_API_URL: 'https://staging-api.example.com/api' }, /does not allow/, { siteConfig: siteWith("'self'") });
  });

  it('a build without an API only needs \'self\'', () => {
    expect(resolve({ VERCEL_ENV: 'preview' }, { siteConfig: siteWith("'self'") }).apiOrigin).toBeNull();
  });

  it('local builds are not served with vercel.json and are not checked against it', () => {
    expect(resolve({ VITE_APP_ENV: 'test', VITE_API_URL: 'http://127.0.0.1:4319/api' }, { siteConfig: undefined }).apiOrigin).toBe('http://127.0.0.1:4319');
  });
});
