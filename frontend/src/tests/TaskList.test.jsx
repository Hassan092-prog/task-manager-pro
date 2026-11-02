import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import TaskList from '../components/TaskList';

describe('TaskList & Kanban Board component', () => {
  const sampleTasks = [
    {
      id: 1,
      title: 'Urgent Backlog Item',
      priority: 'urgent',
      status: 'todo',
      completed: false,
      category: 'Engineering'
    },
    {
      id: 2,
      title: 'Active Development Sprint',
      priority: 'low',
      status: 'in_progress',
      completed: false,
      category: 'Feature'
    },
    {
      id: 3,
      title: 'Shipped Feature',
      priority: 'medium',
      status: 'done',
      completed: true,
      category: 'Release'
    }
  ];

  it('renders linear list view when viewMode is list', () => {
    render(
      <TaskList
        tasks={sampleTasks}
        onUpdateTask={vi.fn()}
        onDeleteTask={vi.fn()}
        viewMode="list"
      />
    );

    expect(screen.getByText('Urgent Backlog Item')).toBeInTheDocument();
    expect(screen.getByText('Active Development Sprint')).toBeInTheDocument();
    expect(screen.getByText('Shipped Feature')).toBeInTheDocument();
    expect(screen.getByText('3 tasks')).toBeInTheDocument();
  });

  it('renders Kanban board with decoupled status columns', () => {
    render(
      <TaskList
        tasks={sampleTasks}
        onUpdateTask={vi.fn()}
        onDeleteTask={vi.fn()}
        viewMode="board"
      />
    );

    // Verify all 3 columns exist
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();

    const todoCol = screen.getByTestId('board-col-todo');
    const inProgCol = screen.getByTestId('board-col-in_progress');
    const doneCol = screen.getByTestId('board-col-done');

    // Crucial: 'Urgent Backlog Item' has priority='urgent' but status='todo'.
    // It MUST be inside the 'To Do' column, decoupling priority from workflow stage.
    expect(within(todoCol).getByText('Urgent Backlog Item')).toBeInTheDocument();
    expect(within(inProgCol).getByText('Active Development Sprint')).toBeInTheDocument();
    expect(within(doneCol).getByText('Shipped Feature')).toBeInTheDocument();
  });

  it('toggles completion on a board task card', () => {
    const handleUpdate = vi.fn();
    render(
      <TaskList
        tasks={sampleTasks}
        onUpdateTask={handleUpdate}
        onDeleteTask={vi.fn()}
        viewMode="board"
      />
    );

    const todoCol = screen.getByTestId('board-col-todo');
    const checkboxBtn = within(todoCol).getByRole('button', { name: /toggle completed/i });
    fireEvent.click(checkboxBtn);

    expect(handleUpdate).toHaveBeenCalledWith(1, {
      completed: true,
      status: 'done'
    });
  });

  it('allows inline editing of board task card title, status, and priority', () => {
    const handleUpdate = vi.fn();
    render(
      <TaskList
        tasks={sampleTasks}
        onUpdateTask={handleUpdate}
        onDeleteTask={vi.fn()}
        viewMode="board"
      />
    );

    const todoCol = screen.getByTestId('board-col-todo');
    const editBtn = within(todoCol).getByRole('button', { name: /edit task/i });
    fireEvent.click(editBtn);

    const titleInput = screen.getByDisplayValue('Urgent Backlog Item');
    fireEvent.change(titleInput, { target: { value: 'Renamed Urgent Item' } });

    const statusSelect = screen.getByLabelText(/task status/i);
    fireEvent.change(statusSelect, { target: { value: 'in_progress' } });

    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);

    expect(handleUpdate).toHaveBeenCalledWith(1, {
      title: 'Renamed Urgent Item',
      priority: 'urgent',
      status: 'in_progress',
      completed: false
    });
  });

  it('renders quiet empty state when tasks list is empty', () => {
    render(
      <TaskList
        tasks={[]}
        onUpdateTask={vi.fn()}
        onDeleteTask={vi.fn()}
        viewMode="board"
        activeNav="board"
      />
    );

    expect(screen.getByText('No tasks on board')).toBeInTheDocument();
  });
});

