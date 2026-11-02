import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DailyCompanion from '../components/DailyCompanion';

describe('DailyCompanion component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const sampleTasks = [
    {
      id: 1,
      title: 'Active Task 1',
      completed: false,
      priority: 'high',
      category: 'Work',
      subtasks: [
        { id: 'st1', title: 'Subtask 1', completed: true },
        { id: 'st2', title: 'Subtask 2', completed: false }
      ]
    },
    {
      id: 2,
      title: 'Completed Task 2',
      completed: true,
      priority: 'medium',
      category: 'Personal',
      subtasks: []
    }
  ];

  it('renders Today Rhythm title and metric tiles', () => {
    render(<DailyCompanion tasks={sampleTasks} />);

    expect(screen.getByText("Today's Rhythm")).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('High Priority')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('calculates rhythm percentage factoring both tasks and subtasks', () => {
    // 2 tasks (1 completed, 1 active) + 2 subtasks (1 completed, 1 active)
    // Completed numerator = 1 + 1 = 2
    // Total denominator = 2 + 2 = 4
    // 2/4 = 50%
    render(<DailyCompanion tasks={sampleTasks} />);

    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders project distribution bars and counts', () => {
    render(<DailyCompanion tasks={sampleTasks} />);

    expect(screen.getByText('Projects Focus')).toBeInTheDocument();
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
  });

  it('renders 7-day week strip and allows selecting a day', () => {
    const handleSelectDate = vi.fn();
    render(<DailyCompanion tasks={sampleTasks} onSelectDate={handleSelectDate} />);

    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();

    const fridayBtn = screen.getByRole('button', { name: /Fri/i });
    fireEvent.click(fridayBtn);

    expect(handleSelectDate).toHaveBeenCalled();
  });

  it('persists scratchpad text to localStorage when edited', () => {
    render(<DailyCompanion tasks={sampleTasks} />);

    const textarea = screen.getByPlaceholderText(/jot fleeting thoughts/i);
    fireEvent.change(textarea, { target: { value: 'Follow up with Sarah on Friday' } });

    expect(localStorage.getItem('tm_scratchpad')).toBe('Follow up with Sarah on Friday');
  });
});
