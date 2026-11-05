import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NewTaskModal from '../components/NewTaskModal';

describe('NewTaskModal component', () => {
  it('returns null when isOpen is false', () => {
    const { container } = render(
      <NewTaskModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders modal dialog and elements when isOpen is true', () => {
    render(
      <NewTaskModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
    expect(screen.getByText('New Task')).toBeInTheDocument();
  });

  it('invokes onClose when clicking close button or pressing Escape', () => {
    const handleClose = vi.fn();
    render(
      <NewTaskModal isOpen={true} onClose={handleClose} onSubmit={vi.fn()} />
    );

    // Close button
    const closeBtn = screen.getByRole('button', { name: /close dialog/i });
    fireEvent.click(closeBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('updates date field when quick preset buttons are clicked', () => {
    const { container } = render(
      <NewTaskModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    const todayPresetBtn = screen.getByRole('button', { name: /today/i });
    fireEvent.click(todayPresetBtn);

    const dateInput = container.querySelector('.modal-date-input');
    expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2}T18:00$/);
  });

  it('adds and removes subtasks within the checklist builder', () => {
    render(
      <NewTaskModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    const subtaskInput = screen.getByPlaceholderText(/\+ add checklist item/i);
    fireEvent.change(subtaskInput, { target: { value: 'Item One' } });

    const addBtn = screen.getByRole('button', { name: /^add$/i });
    fireEvent.click(addBtn);

    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText(/checklist \(1\)/i)).toBeInTheDocument();

    // Remove subtask
    const removeBtn = screen.getByRole('button', { name: /remove checklist item/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText('Item One')).not.toBeInTheDocument();
  });

  it('displays error message when submitted with whitespace-only title via form submission', async () => {
    const { container } = render(
      <NewTaskModal isOpen={true} onClose={vi.fn()} onSubmit={vi.fn()} />
    );

    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    fireEvent.change(titleInput, { target: { value: '   ' } });

    const form = container.querySelector('form');
    fireEvent.submit(form);

    expect(screen.getByText('Please provide a task title')).toBeInTheDocument();
  });

  it('submits task payload with subtasks and auto-stages uncommitted subtask input', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({});
    const handleClose = vi.fn();

    render(
      <NewTaskModal isOpen={true} onClose={handleClose} onSubmit={handleSubmit} />
    );

    const titleInput = screen.getByPlaceholderText('What needs to be done?');
    fireEvent.change(titleInput, { target: { value: 'Deploy Release 2.0' } });

    // Explicitly add first subtask
    const subtaskInput = screen.getByPlaceholderText(/\+ add checklist item/i);
    fireEvent.change(subtaskInput, { target: { value: 'Run smoke test' } });
    fireEvent.click(screen.getByRole('button', { name: /^add$/i }));

    // Type second subtask in input WITHOUT clicking add (tests auto-staging fix)
    fireEvent.change(subtaskInput, { target: { value: 'Notify customer support' } });

    const submitBtn = screen.getByRole('button', { name: /^create task$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Deploy Release 2.0',
        subtasks: expect.arrayContaining([
          expect.objectContaining({ title: 'Run smoke test' }),
          expect.objectContaining({ title: 'Notify customer support' })
        ])
      }));
      expect(handleClose).toHaveBeenCalled();
    });
  });

  describe('Mobile Bottom Sheet drag-to-dismiss', () => {
    it('closes modal when dragged down past 75px threshold', () => {
      const handleClose = vi.fn();
      render(<NewTaskModal isOpen={true} onClose={handleClose} onSubmit={vi.fn()} />);

      const handle = screen.getByTestId('sheet-drag-handle');

      fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 190 }] }); // deltaY = 90 (> 75)
      fireEvent.touchEnd(handle);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close modal when dragged down less than 75px threshold', () => {
      const handleClose = vi.fn();
      render(<NewTaskModal isOpen={true} onClose={handleClose} onSubmit={vi.fn()} />);

      const handle = screen.getByTestId('sheet-drag-handle');

      fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 150 }] }); // deltaY = 50 (< 75)
      fireEvent.touchEnd(handle);

      expect(handleClose).not.toHaveBeenCalled();
    });
  });
});
