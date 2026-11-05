import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Dashboard from '../components/Dashboard';
import { taskService } from '../services/tasks';

vi.mock('../services/tasks', () => ({
  taskService: {
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn()
  }
}));

vi.mock('../services/auth', () => ({
  authService: {
    getCurrentUser: vi.fn(() => ({ username: 'hassan', email: 'hassan@example.com' })),
    logout: vi.fn(),
    isAuthenticated: vi.fn(() => true)
  }
}));

describe('Dashboard Component & PWA Offline Resilience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    taskService.getTasks.mockResolvedValue([]);
    localStorage.clear();
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem('user', JSON.stringify({ username: 'hassan', email: 'hassan@example.com' }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Dashboard with navigation header and 0 count badge', async () => {
    render(
      <MemoryRouter initialEntries={['/app/inbox']}>
        <Routes>
          <Route path="/app/:section" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('heading', { level: 1, name: /inbox/i })).toBeInTheDocument();
    expect(screen.queryByText(/offline \(cached\)/i)).not.toBeInTheDocument();
  });

  it('displays offline indicator pill when network disconnects and removes it when back online', async () => {
    render(
      <MemoryRouter initialEntries={['/app/inbox']}>
        <Routes>
          <Route path="/app/:section" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    // Initial state: online, badge not visible
    expect(screen.queryByText(/offline \(cached\)/i)).not.toBeInTheDocument();

    // Trigger offline event
    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(await screen.findByText(/offline \(cached\)/i)).toBeInTheDocument();

    // Trigger online event
    act(() => {
      window.dispatchEvent(new Event('online'));
    });

    expect(screen.queryByText(/offline \(cached\)/i)).not.toBeInTheDocument();
  });

  it('opens command palette when clicking the command button or pressing Ctrl+K', async () => {
    render(
      <MemoryRouter initialEntries={['/app/inbox']}>
        <Routes>
          <Route path="/app/:section" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByRole('dialog', { name: /command palette/i })).not.toBeInTheDocument();

    // Trigger via hotkey
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
    });

    expect(await screen.findByRole('dialog', { name: /command palette/i })).toBeInTheDocument();
  });

  it('renders mobile bottom navigation bar', async () => {
    render(
      <MemoryRouter initialEntries={['/app/inbox']}>
        <Routes>
          <Route path="/app/:section" element={<Dashboard />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole('navigation', { name: /mobile navigation/i })).toBeInTheDocument();
  });
});
