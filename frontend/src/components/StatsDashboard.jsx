import React, { useMemo, useState } from 'react';
import {
  IconCheckCircle,
  IconBarChart,
  IconCalendar,
  IconClock,
  IconTag,
  IconFlag
} from './Icons';
import './StatsDashboard.css';

const StatsDashboard = ({ tasks = [] }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Core Aggregations & Analytics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completedTasks = tasks.filter(t => t.completed);
    const completed = completedTasks.length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Distinct completion days in UTC/Local normalized YYYY-MM-DD
    const completionDaysSet = new Set();
    completedTasks.forEach(t => {
      const ts = t.completed_at || t.updated_at || t.created_at;
      if (ts) {
        const d = new Date(ts);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          completionDaysSet.add(`${y}-${m}-${day}`);
        }
      }
    });

    // Helper: format Date object to YYYY-MM-DD
    const toYMD = (d) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const now = new Date();
    const todayStr = toYMD(now);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toYMD(yesterday);

    // Current Streak Calculation
    let currentStreak = 0;
    let checkDate = new Date(now);

    if (completionDaysSet.has(todayStr)) {
      currentStreak = 1;
      checkDate.setDate(checkDate.getDate() - 1);
      while (completionDaysSet.has(toYMD(checkDate))) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    } else if (completionDaysSet.has(yesterdayStr)) {
      currentStreak = 1;
      checkDate = new Date(yesterday);
      checkDate.setDate(checkDate.getDate() - 1);
      while (completionDaysSet.has(toYMD(checkDate))) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    // Best Streak Calculation
    const sortedDays = Array.from(completionDaysSet).sort();
    let bestStreak = 0;
    let tempStreak = 0;
    let lastDateObj = null;

    sortedDays.forEach(dayStr => {
      const parts = dayStr.split('-').map(Number);
      const curDateObj = new Date(parts[0], parts[1] - 1, parts[2]);

      if (!lastDateObj) {
        tempStreak = 1;
      } else {
        const diffMs = curDateObj.getTime() - lastDateObj.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
      lastDateObj = curDateObj;
    });

    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    // 14-Day Velocity Series
    const velocity14Days = [];
    let completedIn14DaysCount = 0;

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = toYMD(d);
      const count = completedTasks.filter(t => {
        const ts = t.completed_at || t.updated_at || t.created_at;
        if (!ts) return false;
        const taskDate = new Date(ts);
        return !isNaN(taskDate.getTime()) && toYMD(taskDate) === key;
      }).length;

      completedIn14DaysCount += count;
      const monthName = d.toLocaleDateString(undefined, { month: 'short' });
      const dayNum = d.getDate();
      velocity14Days.push({
        dateKey: key,
        label: `${monthName} ${dayNum}`,
        count
      });
    }

    const velocityAvg = (completedIn14DaysCount / 14).toFixed(1);

    // Category Breakdown
    const categoryMap = {};
    tasks.forEach(t => {
      const cat = (t.category || 'General').trim() || 'General';
      if (!categoryMap[cat]) {
        categoryMap[cat] = { total: 0, completed: 0 };
      }
      categoryMap[cat].total++;
      if (t.completed) categoryMap[cat].completed++;
    });

    const categoryBreakdown = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        total: data.total,
        completed: data.completed,
        rate: Math.round((data.completed / data.total) * 100)
      }))
      .sort((a, b) => b.total - a.total);

    // Priority Breakdown
    const priorities = ['urgent', 'high', 'medium', 'low'];
    const priorityBreakdown = priorities.map(prio => {
      const prioTasks = tasks.filter(t => (t.priority || 'medium').toLowerCase() === prio);
      const prioComp = prioTasks.filter(t => t.completed).length;
      return {
        priority: prio,
        total: prioTasks.length,
        completed: prioComp,
        rate: prioTasks.length > 0 ? Math.round((prioComp / prioTasks.length) * 100) : 0
      };
    });

    return {
      total,
      completed,
      pending,
      completionRate,
      currentStreak,
      bestStreak,
      velocityAvg,
      velocity14Days,
      categoryBreakdown,
      priorityBreakdown
    };
  }, [tasks]);

  // Construct pure SVG Sparkline / Area Chart
  const chartHeight = 160;
  const chartWidth = 640;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 30;

  const maxDailyCount = Math.max(
    ...stats.velocity14Days.map(d => d.count),
    4 // minimum ceiling for aesthetic spacing
  );

  const points = stats.velocity14Days.map((d, index) => {
    const x = paddingX + (index / 13) * (chartWidth - paddingX * 2);
    const usableHeight = chartHeight - paddingTop - paddingBottom;
    const y = chartHeight - paddingBottom - (d.count / maxDailyCount) * usableHeight;
    return { x, y, ...d };
  });

  const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');
  const areaPath = `M ${points[0].x},${chartHeight - paddingBottom} ` +
    points.map(p => `L ${p.x},${p.y}`).join(' ') +
    ` L ${points[points.length - 1].x},${chartHeight - paddingBottom} Z`;

  return (
    <div className="stats-dashboard" data-testid="stats-dashboard">
      {/* 1. Header Overview & Primary KPI Cards */}
      <div className="stats-kpi-grid">
        <div className="stats-kpi-card" data-testid="kpi-completed">
          <div className="stats-kpi-header">
            <span className="stats-kpi-label">Completed Tasks</span>
            <IconCheckCircle size={16} className="stats-kpi-icon icon-emerald" />
          </div>
          <div className="stats-kpi-value">{stats.completed}</div>
          <div className="stats-kpi-subtext">
            <span>{stats.completionRate}% completion rate</span>
            <span className="stats-kpi-pill">{stats.pending} remaining</span>
          </div>
        </div>

        <div className="stats-kpi-card" data-testid="kpi-streak">
          <div className="stats-kpi-header">
            <span className="stats-kpi-label">Daily Streak</span>
            <span className="stats-streak-flame" aria-hidden="true">⚡</span>
          </div>
          <div className="stats-kpi-value">{stats.currentStreak} <span className="stats-kpi-unit">days</span></div>
          <div className="stats-kpi-subtext">
            <span>Best record: {stats.bestStreak} days</span>
            {stats.currentStreak > 0 && <span className="stats-kpi-pill success">Active</span>}
          </div>
        </div>

        <div className="stats-kpi-card" data-testid="kpi-velocity">
          <div className="stats-kpi-header">
            <span className="stats-kpi-label">14-Day Velocity</span>
            <IconBarChart size={16} className="stats-kpi-icon icon-indigo" />
          </div>
          <div className="stats-kpi-value">{stats.velocityAvg} <span className="stats-kpi-unit">tasks/day</span></div>
          <div className="stats-kpi-subtext">
            <span>Past 2 weeks rolling pace</span>
          </div>
        </div>

        <div className="stats-kpi-card" data-testid="kpi-total">
          <div className="stats-kpi-header">
            <span className="stats-kpi-label">Total Backlog</span>
            <IconCalendar size={16} className="stats-kpi-icon" />
          </div>
          <div className="stats-kpi-value">{stats.total}</div>
          <div className="stats-kpi-subtext">
            <span>Across all active workspaces</span>
          </div>
        </div>
      </div>

      {/* 2. 14-Day Velocity Sparkline Curve (Pure SVG) */}
      <div className="stats-section-card" data-testid="stats-velocity-chart">
        <div className="stats-card-header">
          <div className="stats-card-title-group">
            <h2 className="stats-card-title">14-Day Velocity Trend</h2>
            <p className="stats-card-subtitle">Daily completion volume over the last 14 days</p>
          </div>
          <div className="stats-chart-legend">
            <span className="legend-dot" />
            <span>Tasks Completed</span>
          </div>
        </div>

        <div className="stats-svg-container">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="velocity-svg-chart"
            aria-label="14-day completion velocity graph"
            role="img"
          >
            <defs>
              <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-solid, #6366f1)" stopOpacity="0.32" />
                <stop offset="100%" stopColor="var(--accent-solid, #6366f1)" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid Baseline */}
            <line
              x1={paddingX}
              y1={chartHeight - paddingBottom}
              x2={chartWidth - paddingX}
              y2={chartHeight - paddingBottom}
              className="chart-grid-line"
            />
            <line
              x1={paddingX}
              y1={paddingTop}
              x2={chartWidth - paddingX}
              y2={paddingTop}
              className="chart-grid-line subtle"
            />

            {/* Area Fill */}
            <path d={areaPath} fill="url(#velocityGradient)" />

            {/* Stroke Line */}
            <polyline
              points={polylinePoints}
              fill="none"
              className="chart-polyline"
            />

            {/* Interactive Data Point Nodes */}
            {points.map((p, i) => (
              <g key={p.dateKey}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={hoveredPoint === i ? 6 : 4}
                  className={`chart-data-node ${p.count > 0 ? 'has-data' : ''} ${hoveredPoint === i ? 'is-hovered' : ''}`}
                  onMouseEnter={() => setHoveredPoint(i)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onTouchStart={() => setHoveredPoint(i)}
                  tabIndex="0"
                  aria-label={`${p.label}: ${p.count} tasks completed`}
                />
                {/* Minimal X-Axis Date Labels on Alternating Points */}
                {(i % 2 === 0 || i === 13) && (
                  <text
                    x={p.x}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    className="chart-axis-label"
                  >
                    {p.label}
                  </text>
                )}
              </g>
            ))}
          </svg>

          {/* Active Data Point Hover Pill */}
          {hoveredPoint !== null && points[hoveredPoint] && (
            <div
              className="chart-tooltip"
              style={{
                left: `${(points[hoveredPoint].x / chartWidth) * 100}%`,
                top: `${(points[hoveredPoint].y / chartHeight) * 100}%`
              }}
            >
              <div className="tooltip-date">{points[hoveredPoint].label}</div>
              <div className="tooltip-count">
                <strong>{points[hoveredPoint].count}</strong> task{points[hoveredPoint].count === 1 ? '' : 's'} completed
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Category & Priority Distribution Grid */}
      <div className="stats-breakdown-grid">
        {/* Category Breakdown */}
        <div className="stats-section-card" data-testid="stats-category-breakdown">
          <div className="stats-card-header">
            <div className="stats-card-title-group">
              <h2 className="stats-card-title">Category Distribution</h2>
              <p className="stats-card-subtitle">Task volume and completion by tag</p>
            </div>
            <IconTag size={16} className="stats-kpi-icon" />
          </div>

          <div className="category-bars-list">
            {stats.categoryBreakdown.length === 0 ? (
              <div className="stats-empty-notice">No categorized tasks found</div>
            ) : (
              stats.categoryBreakdown.map(cat => (
                <div key={cat.name} className="category-bar-row">
                  <div className="category-bar-meta">
                    <span className="category-bar-name">{cat.name}</span>
                    <span className="category-bar-counts">
                      {cat.completed} / {cat.total} ({cat.rate}%)
                    </span>
                  </div>
                  <div className="category-progress-track">
                    <div
                      className="category-progress-fill"
                      style={{ width: `${cat.rate}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Priority Matrix */}
        <div className="stats-section-card" data-testid="stats-priority-breakdown">
          <div className="stats-card-header">
            <div className="stats-card-title-group">
              <h2 className="stats-card-title">Priority Breakdown</h2>
              <p className="stats-card-subtitle">Completion breakdown by urgency tier</p>
            </div>
            <IconFlag size={16} className="stats-kpi-icon" />
          </div>

          <div className="priority-cards-grid">
            {stats.priorityBreakdown.map(prio => (
              <div key={prio.priority} className="priority-stat-tile">
                <div className="priority-tile-header">
                  <span className={`prio-dot prio-dot-${prio.priority}`} />
                  <span className="priority-tile-title">
                    {prio.priority.charAt(0).toUpperCase() + prio.priority.slice(1)}
                  </span>
                </div>
                <div className="priority-tile-value">
                  {prio.completed} <span className="priority-tile-total">/ {prio.total}</span>
                </div>
                <div className="category-progress-track">
                  <div
                    className={`category-progress-fill prio-fill-${prio.priority}`}
                    style={{ width: `${prio.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;

