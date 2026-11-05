import React from 'react';
import { 
  IconInbox, 
  IconLayoutGrid, 
  IconBarChart, 
  IconPanelRight 
} from './Icons';
import './MobileBottomNav.css';

const MobileBottomNav = ({
  activeNav,
  onNavigate,
  isCompanionVisible,
  onToggleCompanion,
  taskCount = 0
}) => {
  const isTasksActive = ['inbox', 'today', 'upcoming', 'completed'].includes(activeNav) || (activeNav && activeNav.startsWith('tag:'));
  const isBoardActive = activeNav === 'board';
  const isStatsActive = activeNav === 'stats';

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {/* 1. Tasks Tab */}
      <button
        type="button"
        className={`mobile-nav-tab ${isTasksActive ? 'is-active' : ''}`}
        onClick={() => onNavigate('inbox')}
        aria-label="Tasks view"
        aria-current={isTasksActive ? 'page' : undefined}
      >
        <span className="mobile-nav-icon-wrapper">
          <IconInbox size={20} />
          {taskCount > 0 && <span className="mobile-nav-badge">{taskCount > 99 ? '99+' : taskCount}</span>}
        </span>
        <span className="mobile-nav-label">Tasks</span>
      </button>

      {/* 2. Board Tab */}
      <button
        type="button"
        className={`mobile-nav-tab ${isBoardActive ? 'is-active' : ''}`}
        onClick={() => onNavigate('board')}
        aria-label="Kanban board view"
        aria-current={isBoardActive ? 'page' : undefined}
      >
        <span className="mobile-nav-icon-wrapper">
          <IconLayoutGrid size={20} />
        </span>
        <span className="mobile-nav-label">Board</span>
      </button>

      {/* 3. Stats Tab (links to /app/stats) */}
      <button
        type="button"
        className={`mobile-nav-tab ${isStatsActive ? 'is-active' : ''}`}
        onClick={() => onNavigate('stats')}
        aria-label="Productivity stats view"
        aria-current={isStatsActive ? 'page' : undefined}
      >
        <span className="mobile-nav-icon-wrapper">
          <IconBarChart size={20} />
        </span>
        <span className="mobile-nav-label">Stats</span>
      </button>

      {/* 4. Daily Companion Panel Toggle */}
      <button
        type="button"
        className={`mobile-nav-tab ${isCompanionVisible ? 'is-active' : ''}`}
        onClick={onToggleCompanion}
        aria-label="Toggle Daily Rhythm companion"
        aria-expanded={isCompanionVisible}
      >
        <span className="mobile-nav-icon-wrapper">
          <IconPanelRight size={20} />
        </span>
        <span className="mobile-nav-label">Rhythm</span>
      </button>
    </nav>
  );
};

export default MobileBottomNav;

