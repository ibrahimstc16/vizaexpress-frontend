import { describe, expect, it, vi } from 'vitest';
import api, { API_URL, authApi, errorMessage } from './api';

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
