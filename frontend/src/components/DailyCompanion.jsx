import React, { useState, useEffect, useMemo } from 'react';
import { 
  IconCheckCircle, 
  IconClock, 
  IconFileText, 
  IconBarChart, 
  IconTag,
  IconX
} from './Icons';

const DailyCompanion = ({ 
  tasks = [], 
  selectedDateFilter = null, 
  onSelectDate = () => {},
  onClearDateFilter = () => {},
  onClose = () => {}
}) => {
  // Scratchpad state persisted in localStorage
  const [scratchpad, setScratchpad] = useState(() => {
    return localStorage.getItem('tm_scratchpad') || '';
  });

  useEffect(() => {
    localStorage.setItem('tm_scratchpad', scratchpad);
  }, [scratchpad]);

  // Timezone-safe local date string helper (YYYY-MM-DD)
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Compute 7-day week strip (Monday through Sunday of current week)
  const weekDays = useMemo(() => {
    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    // Adjust to Monday as start of week (0 = Monday, 6 = Sunday)
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);
    monday.setHours(0, 0, 0, 0);

    const days = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const isToday = d.toDateString() === now.toDateString();
      const dateStr = formatLocalDate(d);

      // Count tasks for this day
      const dayTasks = tasks.filter(t => {
        if (!t.due_date) return false;
        return t.due_date.startsWith(dateStr);
      });

      const pendingCount = dayTasks.filter(t => !t.completed).length;
      const completedCount = dayTasks.filter(t => t.completed).length;

      days.push({
        date: d,
        dayName: dayNames[i],
        dayNum: d.getDate(),
        dateStr,
        isToday,
        taskCount: dayTasks.length,
        pendingCount,
        completedCount
      });
    }

    return days;
  }, [tasks]);

  // Daily Metrics
  const stats = useMemo(() => {
    const todayStr = formatLocalDate(new Date());

    const activeTasks = tasks.filter(t => !t.completed);
    const completedTasks = tasks.filter(t => t.completed);
    const dueTodayTasks = tasks.filter(t => t.due_date && t.due_date.startsWith(todayStr));
    const completedTodayTasks = dueTodayTasks.filter(t => t.completed);
    const urgentTasks = activeTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');

    const totalTodayOrActive = dueTodayTasks.length;
    
    // Subtask metric aggregation
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    tasks.forEach(t => {
      if (Array.isArray(t.subtasks)) {
        t.subtasks.forEach(s => {
          totalSubtasks++;
          if (s.completed) completedSubtasks++;
        });
      }
    });

    const totalDenominator = totalTodayOrActive + totalSubtasks;
    const completedNumerator = completedTodayTasks.length + completedSubtasks;

    const completionPercent = totalDenominator > 0 
      ? Math.round((completedNumerator / totalDenominator) * 100) 
      : (completedTasks.length > 0 && activeTasks.length === 0 ? 100 : 0);

    // Project breakdown
    const projects = [
      { name: 'Work', color: '#3b82f6' },
      { name: 'Personal', color: '#10b981' },
      { name: 'Engineering', color: '#8b5cf6' },
      { name: 'Design', color: '#f59e0b' }
    ].map(p => {
      const count = activeTasks.filter(t => (t.category || '').toLowerCase() === p.name.toLowerCase()).length;
      return { ...p, count };
    });

    return {
      activeCount: activeTasks.length,
      completedCount: completedTasks.length,
      dueTodayCount: dueTodayTasks.filter(t => !t.completed).length,
      urgentCount: urgentTasks.length,
      completionPercent,
      completedTodayCount: completedTodayTasks.length,
      totalTodayCount: totalTodayOrActive,
      projects
    };
  }, [tasks]);

  return (
    <aside className="daily-companion">
      {/* Mobile/Tablet Drawer Header (Hidden on Wide Desktop >= 1140px) */}
      <div className="companion-drawer-header">
        <span className="companion-drawer-title">Rhythm & Overview</span>
        <button 
          type="button" 
          onClick={onClose}
          className="btn-icon-subtle companion-drawer-close"
          aria-label="Close overview"
          title="Close overview"
        >
          <IconX size={15} />
        </button>
      </div>

      {/* 1. Daily Rhythm Header & Progress Bar */}
      <div className="companion-card">
        <div className="companion-card-header">
          <div className="card-title-group">
            <IconBarChart size={14} className="card-icon" />
            <span className="companion-card-title">Today's Rhythm</span>
          </div>
          <span className={`companion-percent-pill ${stats.completionPercent === 100 ? 'is-complete' : ''}`}>
            {stats.completionPercent === 100 ? '✓ 100%' : `${stats.completionPercent}%`}
          </span>
        </div>

        <div className="progress-bar-track">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${Math.min(100, Math.max(0, stats.completionPercent))}%` }}
          />
        </div>

        <div className="companion-stats-grid">
          <div className="stat-tile">
            <span className="stat-label">Active</span>
            <span className="stat-val">{stats.activeCount}</span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Due Today</span>
            <span className={`stat-val ${stats.dueTodayCount > 0 ? 'highlight-today' : ''}`}>
              {stats.dueTodayCount}
            </span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">High Priority</span>
            <span className={`stat-val ${stats.urgentCount > 0 ? 'highlight-urgent' : ''}`}>
              {stats.urgentCount}
            </span>
          </div>
          <div className="stat-tile">
            <span className="stat-label">Completed</span>
            <span className="stat-val stat-done">{stats.completedCount}</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Week Strip */}
      <div className="companion-card">
        <div className="companion-card-header">
          <div className="card-title-group">
            <IconClock size={14} className="card-icon" />
            <span className="companion-card-title">This Week</span>
          </div>
          {selectedDateFilter && (
            <button 
              type="button" 
              onClick={onClearDateFilter}
              className="btn-clear-date"
              title="Clear date filter"
            >
              Clear filter <IconX size={11} />
            </button>
          )}
        </div>

        <div className="week-strip-row">
          {weekDays.map(d => {
            const isSelected = selectedDateFilter === d.dateStr;
            return (
              <button
                key={d.dateStr}
                type="button"
                onClick={() => onSelectDate(isSelected ? null : d.dateStr)}
                className={`week-day-pill ${d.isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''}`}
                title={`${d.dayName}, ${d.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${d.taskCount} tasks`}
              >
                <span className="week-day-name">{d.dayName}</span>
                <span className="week-day-num">{d.dayNum}</span>
                <span className="week-day-dot-wrapper">
                  {d.pendingCount > 0 && <span className="day-dot pending" />}
                  {d.pendingCount === 0 && d.completedCount > 0 && <span className="day-dot done" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Project Distribution Breakdown */}
      <div className="companion-card">
        <div className="companion-card-header">
          <div className="card-title-group">
            <IconTag size={14} className="card-icon" />
            <span className="companion-card-title">Projects Focus</span>
          </div>
        </div>

        <div className="projects-distribution-list">
          {stats.projects.map(p => {
            const maxCount = Math.max(1, stats.activeCount);
            const pct = Math.round((p.count / maxCount) * 100);
            return (
              <div key={p.name} className="project-dist-row">
                <div className="project-dist-info">
                  <span className="project-dist-dot" style={{ backgroundColor: p.color }} />
                  <span className="project-dist-name">{p.name}</span>
                  <span className="project-dist-count">{p.count}</span>
                </div>
                <div className="project-dist-bar-track">
                  <div 
                    className="project-dist-bar-fill" 
                    style={{ width: `${pct}%`, backgroundColor: p.color }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Fleeting Daily Scratchpad */}
      <div className="companion-card scratchpad-card">
        <div className="companion-card-header">
          <div className="card-title-group">
            <IconFileText size={14} className="card-icon" />
            <span className="companion-card-title">Scratchpad</span>
          </div>
          {scratchpad.trim() && (
            <button 
              type="button" 
              onClick={() => setScratchpad('')}
              className="btn-clear-scratch"
              title="Clear notes"
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          value={scratchpad}
          onChange={(e) => setScratchpad(e.target.value)}
          placeholder="Jot fleeting thoughts, draft items, or quick scratch notes here..."
          className="scratchpad-input"
          rows={3}
        />
      </div>

      {/* 5. Minimal Keyboard Shortcuts Footer */}
      <div className="companion-shortcuts">
        <div className="shortcut-chip"><kbd>N</kbd> New task</div>
        <div className="shortcut-chip"><kbd>/</kbd> Search</div>
        <div className="shortcut-chip"><kbd>Esc</kbd> Dismiss</div>
      </div>
    </aside>
  );
};

export default DailyCompanion;
