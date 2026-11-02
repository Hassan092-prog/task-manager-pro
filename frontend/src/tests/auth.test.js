import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../services/auth';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isAuthenticated returns false when no access token exists', () => {
    expect(authService.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated returns true when access token exists', () => {
    localStorage.setItem('access_token', 'sample-jwt-token');
    expect(authService.isAuthenticated()).toBe(true);
  });

  it('getCurrentUser returns parsed user object from localStorage', () => {
    const user = { id: 1, username: 'testuser', email: 'test@example.com' };
    localStorage.setItem('user', JSON.stringify(user));
    expect(authService.getCurrentUser()).toEqual(user);
  });

  it('getCurrentUser gracefully handles corrupt JSON in localStorage', () => {
    localStorage.setItem('user', 'invalid-json-{');
    expect(authService.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('logout removes access token, refresh token, and user from localStorage', () => {
    localStorage.setItem('access_token', 'token-to-remove');
    localStorage.setItem('refresh_token', 'refresh-token-to-remove');
    localStorage.setItem('user', JSON.stringify({ id: 1 }));
    authService.logout();
    expect(authService.isAuthenticated()).toBe(false);
    expect(authService.getCurrentUser()).toBeNull();
    expect(localStorage.getItem('refresh_token')).toBeNull();
  });
});

