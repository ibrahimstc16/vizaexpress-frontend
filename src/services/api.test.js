import { AxiosError } from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import api, {
  API_URL,
  RETRY_DELAYS_MS,
  authApi,
  createApi,
  errorMessage,
  knownErrorMessage,
  retryAfterSeconds,
  session,
  setUnauthorizedHandler,
} from './api';

const t = (key) => key;

describe('API client without an API address', () => {
  it('unit tests build without one', () => {
    expect(API_URL).toBeNull();
  });

  it('refuses every request before it is sent', async () => {
    const adapter = vi.fn();
    api.defaults.adapter = adapter;
    const error = await authApi.login({ email: 'specimen@example.com', password: 'x' }).catch((e) => e);
    expect(error.code).toBe('API_NOT_CONFIGURED');
    expect(adapter).not.toHaveBeenCalled();
    expect(errorMessage(error, t)).toBe('common.apiNotConfigured');
  });
});

// A synthetic API address and an adapter that answers from a script, so no
// request leaves the test process.
const respond = (status, data = {}, headers = {}) => (config) => {
  const response = { status, data, headers, config, statusText: String(status) };
  if (status < 400) return Promise.resolve(response);
  return Promise.reject(new AxiosError(`Request failed with status code ${status}`, AxiosError.ERR_BAD_RESPONSE, config, null, response));
};
const networkFailure = () => (config) => Promise.reject(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {}));
const timeout = () => (config) => Promise.reject(new AxiosError('timeout of 30000ms exceeded', AxiosError.ECONNABORTED, config, {}));

function scripted(...answers) {
  const calls = [];
  const adapter = vi.fn((config) => {
    calls.push(config);
    const answer = answers[Math.min(calls.length - 1, answers.length - 1)];
    return answer(config);
  });
  const client = createApi('http://api.test/api');
  client.defaults.adapter = adapter;
  return { client, adapter, calls };
}

// Runs a request to the end while letting retry delays pass on fake timers.
async function settle(promise) {
  const result = promise.then((value) => ({ value }), (error) => ({ error }));
  for (let i = 0; i < 10; i += 1) await vi.advanceTimersByTimeAsync(5000);
  return result;
}

describe('API client: retries', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('retries a read twice after network failures, then reports the network', async () => {
    const { client, adapter } = scripted(networkFailure());
    const { error } = await settle(client.get('/applications'));
    expect(adapter).toHaveBeenCalledTimes(1 + RETRY_DELAYS_MS.length);
    expect(errorMessage(error, t)).toBe('common.networkError');
  });

  it('waits before each retry', async () => {
    const { client, adapter } = scripted(networkFailure(), respond(200, { applications: [] }));
    const pending = client.get('/applications');
    await vi.advanceTimersByTimeAsync(RETRY_DELAYS_MS[0] - 1);
    expect(adapter).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect((await pending).data).toEqual({ applications: [] });
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it.each([502, 503, 504])('retries a read after a temporary %i and returns the later answer', async (status) => {
    const { client, adapter } = scripted(respond(status), respond(200, { ok: true }));
    const { value } = await settle(client.get('/applications'));
    expect(value.data).toEqual({ ok: true });
    expect(adapter).toHaveBeenCalledTimes(2);
  });

  it('follows a short Retry-After and does not retry when it is long', async () => {
    const short = scripted(respond(503, { code: 'RATE_LIMIT_UNAVAILABLE' }, { 'retry-after': '2' }), respond(200, {}));
    const pending = short.client.get('/applications');
    await vi.advanceTimersByTimeAsync(1999);
    expect(short.adapter).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    await pending;
    expect(short.adapter).toHaveBeenCalledTimes(2);

    const long = scripted(respond(503, { code: 'RATE_LIMIT_UNAVAILABLE' }, { 'retry-after': '60' }));
    const { error } = await settle(long.client.get('/applications'));
    expect(long.adapter).toHaveBeenCalledTimes(1);
    expect(errorMessage(error, t)).toBe('apiErrors.busy');
  });

  it.each([
    ['maintenance', respond(503, { code: 'MAINTENANCE' }, { 'retry-after': '3600' })],
    ['a switched-off feature', respond(503, { code: 'PAYMENTS_DISABLED' })],
    ['too many requests', respond(429, { code: 'RATE_LIMITED' }, { 'retry-after': '30' })],
    ['too many requests, from a proxy without a code', respond(429)],
    ['a refusal', respond(403, { error: 'Access denied' })],
    ['a timeout', timeout()],
  ])('does not retry a read after %s', async (_label, answer) => {
    const { client, adapter } = scripted(answer);
    await settle(client.get('/payments/verify/cs_specimen'));
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['sign-in', (c) => c.post('/auth/login', {})],
    ['registration', (c) => c.post('/auth/register', {})],
    ['upload', (c) => c.post('/documents/upload', new FormData())],
    ['checkout', (c) => c.post('/payments/create-checkout-session', {})],
    ['status change', (c) => c.put('/admin/applications/1/status', {})],
  ])('never repeats a write (%s), even after a network failure', async (_label, send) => {
    const { client, adapter } = scripted(networkFailure());
    await settle(send(client));
    expect(adapter).toHaveBeenCalledTimes(1);
  });

  it('can be switched off for one read', async () => {
    const { client, adapter } = scripted(networkFailure());
    await settle(client.get('/applications', { retry: false }));
    expect(adapter).toHaveBeenCalledTimes(1);
  });
});

describe('API client: time limits and sign-in state', () => {
  afterEach(() => {
    session.clear();
    setUnauthorizedHandler(null);
  });

  it('gives up after 30 seconds, uploads after 2 minutes', () => {
    expect(createApi('http://api.test/api').defaults.timeout).toBe(30000);
    const { client, calls } = scripted(respond(200, {}));
    return client.post('/documents/upload', new FormData(), { timeout: 120000 }).then(() => {
      expect(calls[0].timeout).toBe(120000);
    });
  });

  it('sends the stored token', async () => {
    session.save('specimen-token', { id: 'u1' });
    const { client, calls } = scripted(respond(200, {}));
    await client.get('/auth/me');
    expect(calls[0].headers.Authorization).toBe('Bearer specimen-token');
  });

  it('ends the session on a 401 from a signed-in call', async () => {
    session.save('specimen-token', { id: 'u1' });
    const expired = vi.fn();
    setUnauthorizedHandler(expired);
    const { client } = scripted(respond(401, { error: 'Session expired', code: 'INVALID_TOKEN' }));
    const error = await client.get('/applications').catch((e) => e);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(session.getToken()).toBeNull();
    expect(errorMessage(error, t)).toBe('apiErrors.sessionExpired');
  });

  it('keeps the session when sign-in itself answers 401', async () => {
    session.save('specimen-token', { id: 'u1' });
    const expired = vi.fn();
    setUnauthorizedHandler(expired);
    const { client } = scripted(respond(401, { error: 'Invalid email or password' }));
    await client.post('/auth/login', {}).catch(() => {});
    expect(expired).not.toHaveBeenCalled();
    expect(session.getToken()).toBe('specimen-token');
  });
});

describe('error messages', () => {
  const tv = (key, vars) => (vars ? `${key} ${JSON.stringify(vars)}` : key);
  const failed = (status, data = {}, headers = {}) => ({ response: { status, data, headers } });

  it.each([
    [failed(503, { code: 'MAINTENANCE' }), 'apiErrors.maintenance {"email":"contact@vizaexpress.com"}'],
    [failed(503, { code: 'REGISTRATION_DISABLED' }), 'apiErrors.registrationDisabled'],
    [failed(503, { code: 'PAYMENTS_DISABLED' }), 'apiErrors.paymentsDisabled'],
    [failed(503, { code: 'RATE_LIMIT_UNAVAILABLE' }), 'apiErrors.busy'],
    [failed(429, { code: 'RATE_LIMITED' }, { 'retry-after': '900' }), 'apiErrors.rateLimited {"minutes":15}'],
    [failed(429, { code: 'RATE_LIMITED' }, { 'retry-after': '20' }), 'apiErrors.rateLimited {"minutes":1}'],
    [failed(429, { code: 'RATE_LIMITED' }), 'apiErrors.rateLimitedNoTime'],
    [failed(429), 'apiErrors.rateLimitedNoTime'],
    [failed(503), 'apiErrors.unavailable'],
    [failed(500), 'common.genericError'],
    [failed(403, { error: 'Access denied' }), 'apiErrors.forbidden'],
    [failed(401), 'apiErrors.sessionExpired'],
    [failed(400, { error: 'Invalid package' }), 'Invalid package'],
    [{ code: 'ECONNABORTED' }, 'apiErrors.timeout'],
    [{ code: 'ERR_NETWORK' }, 'common.networkError'],
    [{ code: 'API_NOT_CONFIGURED' }, 'common.apiNotConfigured'],
  ])('%#: %j', (error, expected) => {
    expect(errorMessage(error, tv)).toBe(expected);
  });

  it('leaves other answers to the caller', () => {
    expect(knownErrorMessage(failed(401), tv)).toBeNull();
    expect(knownErrorMessage(failed(400, { error: 'x' }), tv)).toBeNull();
    expect(knownErrorMessage({ code: 'ERR_NETWORK' }, tv)).toBeNull();
  });

  it('ignores a Retry-After it cannot read', () => {
    expect(retryAfterSeconds(failed(429, {}, { 'retry-after': 'Wed, 21 Oct 2026 07:28:00 GMT' }))).toBeNull();
    expect(retryAfterSeconds(failed(429, {}, { 'retry-after': '-5' }))).toBeNull();
  });
});
