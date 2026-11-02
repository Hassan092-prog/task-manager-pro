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
});

