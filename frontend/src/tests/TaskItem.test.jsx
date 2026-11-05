import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaskItem from '../components/TaskItem';

describe('TaskItem component', () => {
  const sampleTask = {
    id: 42,
    title: 'Review system design documentation',
    description: 'Ensure architecture diagram is up to date',
    priority: 'urgent',
    category: 'Engineering',
    completed: false,
    due_date: '2026-11-05T18:00:00'
  };

  it('renders task title and description correctly', () => {
    render(<TaskItem task={sampleTask} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Review system design documentation')).toBeInTheDocument();
    expect(screen.getByText('Ensure architecture diagram is up to date')).toBeInTheDocument();
    expect(screen.getByText('Engineering')).toBeInTheDocument();
  });

  it('invokes onUpdate with synchronized status when checkbox circle is clicked', () => {
    const handleUpdate = vi.fn();
    render(<TaskItem task={sampleTask} onUpdate={handleUpdate} onDelete={vi.fn()} />);
    
    const checkboxBtn = screen.getByRole('button', { name: /mark completed/i });
    fireEvent.click(checkboxBtn);

    expect(handleUpdate).toHaveBeenCalledWith(42, { completed: true, status: 'done' });
  });

  it('renders In Progress badge when task is in_progress and not completed', () => {
    const inProgTask = { ...sampleTask, status: 'in_progress', completed: false };
    render(<TaskItem task={inProgTask} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('In Progress')).toBeInTheDocument();
  });

  it('invokes onDelete when delete button is clicked', () => {
    const handleDelete = vi.fn();
    render(<TaskItem task={sampleTask} onUpdate={vi.fn()} onDelete={handleDelete} />);
    
    const deleteBtn = screen.getByRole('button', { name: /delete task/i });
    fireEvent.click(deleteBtn);

    expect(handleDelete).toHaveBeenCalledWith(42);
  });

  it('switches to inline edit mode when edit button is clicked', () => {
    render(<TaskItem task={sampleTask} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    
    const editBtn = screen.getByRole('button', { name: /edit task/i });
    fireEvent.click(editBtn);

    const titleInput = screen.getByDisplayValue('Review system design documentation');
    expect(titleInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('renders subtask badge and expands checklist when toggled', () => {
    const taskWithSubtasks = {
      ...sampleTask,
      subtasks: [
        { id: 'st-1', title: 'Draft OpenAPI spec', completed: true },
        { id: 'st-2', title: 'Validate schema types', completed: false }
      ]
    };

    render(<TaskItem task={taskWithSubtasks} onUpdate={vi.fn()} onDelete={vi.fn()} />);
    
    // Check subtask badge shows '1/2'
    const subtaskBadge = screen.getByRole('button', { name: /toggle 2 subtasks/i });
    expect(subtaskBadge).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();

    // Checklist initially collapsed
    expect(screen.queryByTestId('subtasks-container-42')).not.toBeInTheDocument();

    // Click badge to expand
    fireEvent.click(subtaskBadge);
    expect(screen.getByTestId('subtasks-container-42')).toBeInTheDocument();
    expect(screen.getByText('Draft OpenAPI spec')).toBeInTheDocument();
    expect(screen.getByText('Validate schema types')).toBeInTheDocument();
  });

  it('toggles subtask completion and calls onUpdate', () => {
    const handleUpdate = vi.fn();
    const taskWithSubtasks = {
      ...sampleTask,
      subtasks: [
        { id: 'st-1', title: 'Draft OpenAPI spec', completed: false }
      ]
    };

    render(<TaskItem task={taskWithSubtasks} onUpdate={handleUpdate} onDelete={vi.fn()} />);

    // Expand
    fireEvent.click(screen.getByRole('button', { name: /toggle 1 subtasks/i }));

    // Toggle subtask
    const subtaskCheckbox = screen.getByRole('button', { name: /mark subtask Draft OpenAPI spec complete/i });
    fireEvent.click(subtaskCheckbox);

    expect(handleUpdate).toHaveBeenCalledWith(42, {
      subtasks: [{ id: 'st-1', title: 'Draft OpenAPI spec', completed: true }]
    });
  });

  it('adds a new subtask via inline input', () => {
    const handleUpdate = vi.fn();
    const taskWithSubtasks = {
      ...sampleTask,
      subtasks: []
    };

    render(<TaskItem task={taskWithSubtasks} onUpdate={handleUpdate} onDelete={vi.fn()} />);

    // Click "Add checklist item" action button to open container
    const addSubtaskBtn = screen.getByRole('button', { name: /add checklist item/i });
    fireEvent.click(addSubtaskBtn);

    const input = screen.getByPlaceholderText('+ Add subtask...');
    fireEvent.change(input, { target: { value: 'Write unit tests' } });

    const addBtn = screen.getByRole('button', { name: /^add$/i });
    fireEvent.click(addBtn);

    expect(handleUpdate).toHaveBeenCalledWith(42, {
      subtasks: expect.arrayContaining([
        expect.objectContaining({
          title: 'Write unit tests',
          completed: false
        })
      ])
    });
  });

  describe('Touch swipe gestures (Mobile)', () => {
    it('triggers completion when swiped right beyond 75px threshold', () => {
      const handleUpdate = vi.fn();
      render(<TaskItem task={sampleTask} onUpdate={handleUpdate} onDelete={vi.fn()} />);

      const row = screen.getByText('Review system design documentation').closest('.task-row');

      // Touch start at x=100, y=100
      fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });

      // Move horizontally right to x=190 (dx = 90 > 75)
      fireEvent.touchMove(row, { touches: [{ clientX: 190, clientY: 102 }] });

      // End touch
      fireEvent.touchEnd(row);

      expect(handleUpdate).toHaveBeenCalledWith(42, { completed: true, status: 'done' });
    });

    it('triggers deletion when swiped left beyond -75px threshold', () => {
      const handleDelete = vi.fn();
      render(<TaskItem task={sampleTask} onUpdate={vi.fn()} onDelete={handleDelete} />);

      const row = screen.getByText('Review system design documentation').closest('.task-row');

      // Touch start at x=200, y=100
      fireEvent.touchStart(row, { touches: [{ clientX: 200, clientY: 100 }] });

      // Move horizontally left to x=110 (dx = -90 < -75)
      fireEvent.touchMove(row, { touches: [{ clientX: 110, clientY: 100 }] });

      // End touch
      fireEvent.touchEnd(row);

      expect(handleDelete).toHaveBeenCalledWith(42);
    });

    it('does not trigger actions if swipe distance is under threshold', () => {
      const handleUpdate = vi.fn();
      const handleDelete = vi.fn();
      render(<TaskItem task={sampleTask} onUpdate={handleUpdate} onDelete={handleDelete} />);

      const row = screen.getByText('Review system design documentation').closest('.task-row');

      fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchMove(row, { touches: [{ clientX: 140, clientY: 100 }] }); // dx = 40 (< 75)
      fireEvent.touchEnd(row);

      expect(handleUpdate).not.toHaveBeenCalled();
      expect(handleDelete).not.toHaveBeenCalled();
    });

    it('locks axis and aborts horizontal action when gesture is vertical scrolling', () => {
      const handleUpdate = vi.fn();
      const handleDelete = vi.fn();
      render(<TaskItem task={sampleTask} onUpdate={handleUpdate} onDelete={handleDelete} />);

      const row = screen.getByText('Review system design documentation').closest('.task-row');

      fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });
      // Move vertically dy=50, dx=10
      fireEvent.touchMove(row, { touches: [{ clientX: 110, clientY: 150 }] });
      // Move further horizontally after locked
      fireEvent.touchMove(row, { touches: [{ clientX: 200, clientY: 155 }] });
      fireEvent.touchEnd(row);

      expect(handleUpdate).not.toHaveBeenCalled();
      expect(handleDelete).not.toHaveBeenCalled();
    });

    it('ignores swipe gestures while in inline edit mode', () => {
      const handleUpdate = vi.fn();
      render(<TaskItem task={sampleTask} onUpdate={handleUpdate} onDelete={vi.fn()} />);

      // Switch to edit mode
      fireEvent.click(screen.getByRole('button', { name: /edit task/i }));

      const row = screen.getByDisplayValue('Review system design documentation').closest('.task-row');
      fireEvent.touchStart(row, { touches: [{ clientX: 100, clientY: 100 }] });
      fireEvent.touchMove(row, { touches: [{ clientX: 200, clientY: 100 }] });
      fireEvent.touchEnd(row);

      expect(handleUpdate).not.toHaveBeenCalled();
    });
  });
});


