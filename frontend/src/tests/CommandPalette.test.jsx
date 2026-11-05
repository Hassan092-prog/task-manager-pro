import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CommandPalette from '../components/CommandPalette';

describe('CommandPalette component', () => {
  const sampleTasks = [
    {
      id: 1,
      title: 'Review System Architecture Specs',
      description: 'Ensure diagram is up to date',
      priority: 'urgent',
      status: 'in_progress',
      completed: false,
      category: 'Engineering'
    },
    {
      id: 2,
      title: 'Ship V2 Release',
      description: 'Deploy docker containers',
      priority: 'high',
      status: 'done',
      completed: true,
      category: 'DevOps'
    },
    {
      id: 3,
      title: 'Draft User Guidelines',
      description: 'Write markdown docs',
      priority: 'low',
      status: 'todo',
      completed: false,
      category: 'General'
    }
  ];

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <CommandPalette
        isOpen={false}
        onClose={vi.fn()}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    expect(container.firstChild).toBeNull();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders command palette dialog and focusable combobox when isOpen is true', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: /command palette/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/type a command or search tasks/i)).toBeInTheDocument();
  });

  it('renders standard navigation, quick actions, and project tags', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
        theme="dark"
      />
    );

    // Navigation items
    expect(screen.getByText('Go to Inbox')).toBeInTheDocument();
    expect(screen.getByText('Go to Today')).toBeInTheDocument();
    expect(screen.getByText('Go to Upcoming')).toBeInTheDocument();
    expect(screen.getByText('Go to Completed')).toBeInTheDocument();
    expect(screen.getByText('Go to Kanban Board')).toBeInTheDocument();

    // Dynamic project tags from tasks
    expect(screen.getByText('Project: Engineering')).toBeInTheDocument();
    expect(screen.getByText('Project: DevOps')).toBeInTheDocument();

    // Quick Actions
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.getByText('Switch to Light Mode')).toBeInTheDocument();
    expect(screen.getByText('Toggle Daily Companion Panel')).toBeInTheDocument();
    expect(screen.getByText('Clear Completed Tasks')).toBeInTheDocument();
  });

  it('filters actions and tasks dynamically by search input query', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'Today' } });

    expect(screen.getByText('Go to Today')).toBeInTheDocument();
    expect(screen.queryByText('Go to Inbox')).not.toBeInTheDocument();
    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();

    // Search for a task title
    fireEvent.change(input, { target: { value: 'Architecture' } });
    expect(screen.getByText('Review System Architecture Specs')).toBeInTheDocument();
    expect(screen.queryByText('Ship V2 Release')).not.toBeInTheDocument();
  });

  it('shows quiet empty state when no commands or tasks match', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.change(input, { target: { value: 'xyznonexistent123' } });

    expect(screen.getByText(/no commands or tasks matching "xyznonexistent123"/i)).toBeInTheDocument();
  });

  it('navigates highlight with ArrowDown / ArrowUp and wraps around', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    const options = screen.getAllByRole('option');
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    // Arrow down
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(options[1]).toHaveAttribute('aria-selected', 'true');
    expect(options[0]).toHaveAttribute('aria-selected', 'false');

    // Arrow up wraps back to bottom
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(options[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
  });

  it('executes action callback and closes palette when Enter is pressed', () => {
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        tasks={sampleTasks}
        navigate={handleNavigate}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    // First item is "Go to Inbox"
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(handleNavigate).toHaveBeenCalledWith('inbox');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('invokes onClose when clicking the backdrop overlay', () => {
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    const backdrop = screen.getByTestId('command-palette-backdrop');
    fireEvent.click(backdrop);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('triggers item callback when directly clicked', () => {
    const handleNewTask = vi.fn();
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={handleNewTask}
        onClearCompleted={vi.fn()}
      />
    );

    const newTaskOption = screen.getByText('Create New Task');
    fireEvent.click(newTaskOption);

    expect(handleNewTask).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('navigates to appropriate view when selecting a task', () => {
    const handleNavigate = vi.fn();
    const handleClose = vi.fn();

    render(
      <CommandPalette
        isOpen={true}
        onClose={handleClose}
        tasks={sampleTasks}
        navigate={handleNavigate}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
      />
    );

    // Click on in-progress task (should route to board)
    const inProgressTask = screen.getByText('Review System Architecture Specs');
    fireEvent.click(inProgressTask);
    expect(handleNavigate).toHaveBeenCalledWith('board');
    expect(handleClose).toHaveBeenCalled();

    // Click on completed task (should route to completed)
    const completedTask = screen.getByText('Ship V2 Release');
    fireEvent.click(completedTask);
    expect(handleNavigate).toHaveBeenCalledWith('completed');
  });

  it('shows Switch to Dark Mode when theme is light', () => {
    render(
      <CommandPalette
        isOpen={true}
        onClose={vi.fn()}
        tasks={sampleTasks}
        navigate={vi.fn()}
        onToggleCompanion={vi.fn()}
        onToggleTheme={vi.fn()}
        onNewTask={vi.fn()}
        onClearCompleted={vi.fn()}
        theme="light"
      />
    );

    expect(screen.getByText('Switch to Dark Mode')).toBeInTheDocument();
  });
});

