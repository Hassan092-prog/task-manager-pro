import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestRoute from '../components/GuestRoute';

describe('Route Guards', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('ProtectedRoute', () => {
    it('redirects unauthenticated users to /login', () => {
      render(
        <MemoryRouter initialEntries={['/app/inbox']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/app/inbox"
              element={
                <ProtectedRoute>
                  <div>Secret Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Login Page')).toBeInTheDocument();
      expect(screen.queryByText('Secret Dashboard Content')).not.toBeInTheDocument();
    });

    it('renders protected child content when authenticated', () => {
      localStorage.setItem('access_token', 'valid-test-token');

      render(
        <MemoryRouter initialEntries={['/app/inbox']}>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/app/inbox"
              element={
                <ProtectedRoute>
                  <div>Secret Dashboard Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Secret Dashboard Content')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });
  });

  describe('GuestRoute', () => {
    it('renders guest child content when user is not authenticated', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div>Public Login Screen</div>
                </GuestRoute>
              }
            />
            <Route path="/app/inbox" element={<div>App Inbox</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('Public Login Screen')).toBeInTheDocument();
      expect(screen.queryByText('App Inbox')).not.toBeInTheDocument();
    });

    it('redirects authenticated users away to /app/inbox', () => {
      localStorage.setItem('access_token', 'valid-test-token');

      render(
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <div>Public Login Screen</div>
                </GuestRoute>
              }
            />
            <Route path="/app/inbox" element={<div>App Inbox</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText('App Inbox')).toBeInTheDocument();
      expect(screen.queryByText('Public Login Screen')).not.toBeInTheDocument();
    });
  });
});

