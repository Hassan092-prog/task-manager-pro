import { describe, it, expect, beforeEach, vi } from 'vitest';
import api from '../services/api';

describe('API Service & Axios Interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('attaches Bearer token in request header if token is in localStorage', async () => {
    localStorage.setItem('access_token', 'valid-test-token-123');

    // Run the request interceptor handler directly
    const interceptor = api.interceptors.request.handlers[0];
    const initialConfig = { headers: {} };
    const modifiedConfig = interceptor.fulfilled(initialConfig);

    expect(modifiedConfig.headers.Authorization).toBe('Bearer valid-test-token-123');
  });

  it('does not attach Authorization header if access_token is absent', async () => {
    const interceptor = api.interceptors.request.handlers[0];
    const initialConfig = { headers: {} };
    const modifiedConfig = interceptor.fulfilled(initialConfig);

    expect(modifiedConfig.headers.Authorization).toBeUndefined();
  });

  it('passes through successful responses unchanged', () => {
    const interceptor = api.interceptors.response.handlers[0];
    const sampleResponse = { status: 200, data: { ok: true } };
    const result = interceptor.fulfilled(sampleResponse);

    expect(result).toBe(sampleResponse);
  });

  it('clears localStorage session credentials on 401 response for app routes', async () => {
    localStorage.setItem('access_token', 'stale-token');
    localStorage.setItem('user', JSON.stringify({ username: 'tester' }));

    const reloadMock = vi.fn();
    delete window.location;
    window.location = { reload: reloadMock };

    const interceptor = api.interceptors.response.handlers[0];
    const error401 = {
      config: { url: '/tasks' },
      response: { status: 401, data: { msg: 'Token expired' } }
    };

    await expect(interceptor.rejected(error401)).rejects.toEqual(error401);

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(reloadMock).toHaveBeenCalled();
  });

  it('does not clear credentials on 401 for auth login/register routes', async () => {
    localStorage.setItem('access_token', 'existing-token');
    localStorage.setItem('user', JSON.stringify({ username: 'tester' }));

    const reloadMock = vi.fn();
    delete window.location;
    window.location = { reload: reloadMock };

    const interceptor = api.interceptors.response.handlers[0];
    const loginError = {
      config: { url: '/auth/login' },
      response: { status: 401, data: { error: 'Invalid email or password' } }
    };

    await expect(interceptor.rejected(loginError)).rejects.toEqual(loginError);

    expect(localStorage.getItem('access_token')).toBe('existing-token');
    expect(reloadMock).not.toHaveBeenCalled();
  });
});

