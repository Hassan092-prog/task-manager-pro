import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MobileBottomNav from '../components/MobileBottomNav';

describe('MobileBottomNav Component', () => {
  it('renders all 4 navigation tabs', () => {
    render(
      <MobileBottomNav
        activeNav="inbox"
        onNavigate={vi.fn()}
        isCompanionVisible={false}
        onToggleCompanion={vi.fn()}
        taskCount={5}
      />
    );

    expect(screen.getByRole('button', { name: /Tasks view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Kanban board view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Productivity stats view/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle Daily Rhythm companion/i })).toBeInTheDocument();
  });

  it('marks Tasks tab as active when activeNav is inbox, today, upcoming, or a project tag', () => {
    const { rerender } = render(
      <MobileBottomNav
        activeNav="inbox"
        onNavigate={vi.fn()}
        isCompanionVisible={false}
        onToggleCompanion={vi.fn()}
      />
    );

    const tasksTab = screen.getByRole('button', { name: /Tasks view/i });
    expect(tasksTab).toHaveClass('is-active');
    expect(tasksTab).toHaveAttribute('aria-current', 'page');

    rerender(
      <MobileBottomNav
        activeNav="tag:Work"
        onNavigate={vi.fn()}
        isCompanionVisible={false}
        onToggleCompanion={vi.fn()}
      />
    );
    expect(tasksTab).toHaveClass('is-active');
  });

  it('marks Board tab as active when activeNav is board', () => {
    render(
      <MobileBottomNav
        activeNav="board"
        onNavigate={vi.fn()}
        isCompanionVisible={false}
        onToggleCompanion={vi.fn()}
      />
    );

    const boardTab = screen.getByRole('button', { name: /Kanban board view/i });
    expect(boardTab).toHaveClass('is-active');
    expect(boardTab).toHaveAttribute('aria-current', 'page');
  });

  it('marks Stats tab as active when activeNav is stats', () => {
    render(
      <MobileBottomNav
        activeNav="stats"
        onNavigate={vi.fn()}
        isCompanionVisible={false}
        onToggleCompanion={vi.fn()}
      />
    );

    const statsTab = screen.getByRole('button', { name: /Productivity stats view/i });
    expect(statsTab).toHaveClass('is-active');
    expect(statsTab).toHaveAttribute('aria-current', 'page');
  });

  it('triggers onNavigate with correct targets on click', () => {
    const onNavigate = vi.fn();
    render(
      <MobileBottomNav
        activeNav="inbox"
        onNavigate={onNavigate}
        isCompanionVisible={false}
        onToggleCompanion={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Kanban board view/i }));
    expect(onNavigate).toHaveBeenCalledWith('board');

    fireEvent.click(screen.getByRole('button', { name: /Productivity stats view/i }));
    expect(onNavigate).toHaveBeenCalledWith('stats');

    fireEvent.click(screen.getByRole('button', { name: /Tasks view/i }));
    expect(onNavigate).toHaveBeenCalledWith('inbox');
  });

  it('toggles companion drawer when Rhythm tab is clicked', () => {
    const onToggleCompanion = vi.fn();
    render(
      <MobileBottomNav
        activeNav="inbox"
        onNavigate={vi.fn()}
        isCompanionVisible={false}
        onToggleCompanion={onToggleCompanion}
      />
    );

    const rhythmTab = screen.getByRole('button', { name: /Toggle Daily Rhythm companion/i });
    expect(rhythmTab).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(rhythmTab);
    expect(onToggleCompanion).toHaveBeenCalledTimes(1);
  });

  it('displays badge count correctly including 99+ ceiling', () => {
    const { rerender } = render(
      <MobileBottomNav
        activeNav="inbox"
        onNavigate={vi.fn()}
        isCompanionVisible={false}
        onToggleCompanion={vi.fn()}
        taskCount={12}
      />
    );

    expect(screen.getByText('12')).toBeInTheDocument();

    rerender(
      <MobileBottomNav
        activeNav="inbox"
        onNavigate={vi.fn()}
        isCompanionVisible={false}
        onToggleCompanion={vi.fn()}
        taskCount={150}
      />
    );

    expect(screen.getByText('99+')).toBeInTheDocument();
  });
});

