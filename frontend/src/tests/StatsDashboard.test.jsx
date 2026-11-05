import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StatsDashboard from '../components/StatsDashboard';

describe('StatsDashboard Component (Phase 9 Analytics)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-05T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const sampleTasks = [
    {
      id: 1,
      title: 'Completed Task 1',
      completed: true,
      status: 'done',
      priority: 'urgent',
      category: 'Engineering',
      completed_at: '2026-11-05T10:00:00Z' // Today
    },
    {
      id: 2,
      title: 'Completed Task 2',
      completed: true,
      status: 'done',
      priority: 'high',
      category: 'Engineering',
      completed_at: '2026-11-04T15:30:00Z' // Yesterday
    },
    {
      id: 3,
      title: 'Completed Task 3',
      completed: true,
      status: 'done',
      priority: 'medium',
      category: 'Design',
      completed_at: '2026-11-03T09:00:00Z' // 2 days ago
    },
    {
      id: 4,
      title: 'Pending Task 4',
      completed: false,
      status: 'in_progress',
      priority: 'urgent',
      category: 'Work',
      created_at: '2026-11-02T10:00:00Z'
    },
    {
      id: 5,
      title: 'Pending Task 5',
      completed: false,
      status: 'todo',
      priority: 'low',
      category: 'Personal',
      created_at: '2026-11-01T10:00:00Z'
    }
  ];

  it('renders summary KPI metric cards correctly', () => {
    render(<StatsDashboard tasks={sampleTasks} />);

    // Total completed: 3 out of 5 -> 60% completion rate
    const compCard = screen.getByTestId('kpi-completed');
    expect(compCard).toHaveTextContent('3');
    expect(compCard).toHaveTextContent('60% completion rate');
    expect(compCard).toHaveTextContent('2 remaining');

    // Total backlog
    const totalCard = screen.getByTestId('kpi-total');
    expect(totalCard).toHaveTextContent('5');

    // Streak: tasks completed today (Nov 5), yesterday (Nov 4), and Nov 3 -> 3 day streak
    const streakCard = screen.getByTestId('kpi-streak');
    expect(streakCard).toHaveTextContent('3 days');
    expect(streakCard).toHaveTextContent('Active');

    // Velocity: 3 completed tasks in 14 days -> (3 / 14) = 0.2 tasks/day
    const velocityCard = screen.getByTestId('kpi-velocity');
    expect(velocityCard).toHaveTextContent('0.2 tasks/day');
  });

  it('renders 14-day velocity SVG sparkline chart with nodes and date labels', () => {
    render(<StatsDashboard tasks={sampleTasks} />);

    const chartContainer = screen.getByTestId('stats-velocity-chart');
    expect(chartContainer).toBeInTheDocument();

    const svg = chartContainer.querySelector('svg.velocity-svg-chart');
    expect(svg).toBeInTheDocument();

    // Contains polyline and area path
    expect(svg.querySelector('polyline.chart-polyline')).toBeInTheDocument();
    expect(svg.querySelector('path')).toBeInTheDocument();

    // 14 interactive data nodes
    const nodes = svg.querySelectorAll('.chart-data-node');
    expect(nodes.length).toBe(14);
  });

  it('reveals interactive tooltip when hovering or touching a chart data node', () => {
    render(<StatsDashboard tasks={sampleTasks} />);

    const chartContainer = screen.getByTestId('stats-velocity-chart');
    const nodes = chartContainer.querySelectorAll('.chart-data-node');

    // Hover today's node (the last node, index 13)
    fireEvent.mouseEnter(nodes[13]);

    const tooltip = chartContainer.querySelector('.chart-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent(/1 task completed/i);

    // Leave hover
    fireEvent.mouseLeave(nodes[13]);
    expect(chartContainer.querySelector('.chart-tooltip')).toBeNull();
  });

  it('renders category distribution progress bars', () => {
    render(<StatsDashboard tasks={sampleTasks} />);

    const catSection = screen.getByTestId('stats-category-breakdown');
    expect(catSection).toBeInTheDocument();

    expect(screen.getByText('Engineering')).toBeInTheDocument();
    expect(screen.getByText('2 / 2 (100%)')).toBeInTheDocument();

    expect(screen.getByText('Design')).toBeInTheDocument();
    expect(screen.getByText('1 / 1 (100%)')).toBeInTheDocument();

    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Personal')).toBeInTheDocument();
    expect(screen.getAllByText('0 / 1 (0%)')).toHaveLength(2);
  });

  it('renders priority breakdown tiers', () => {
    render(<StatsDashboard tasks={sampleTasks} />);

    const prioSection = screen.getByTestId('stats-priority-breakdown');
    expect(prioSection).toBeInTheDocument();

    expect(screen.getByText('Urgent')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('handles empty task list gracefully with zero-state fallbacks', () => {
    render(<StatsDashboard tasks={[]} />);

    const compCard = screen.getByTestId('kpi-completed');
    expect(compCard).toHaveTextContent('0');
    expect(compCard).toHaveTextContent('0% completion rate');

    const streakCard = screen.getByTestId('kpi-streak');
    expect(streakCard).toHaveTextContent('0 days');

    expect(screen.getByText('No categorized tasks found')).toBeInTheDocument();
  });
});
