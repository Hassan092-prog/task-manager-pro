import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { taskService } from '../services/tasks';
import { authService } from '../services/auth';
import TaskList from './TaskList';
import DailyCompanion from './DailyCompanion';
import NewTaskModal from './NewTaskModal';
import { 
  IconInbox, 
  IconCalendar, 
  IconCheckCircle, 
  IconClock,
  IconTag, 
  IconSearch, 
  IconPlus, 
  IconSun, 
  IconMoon, 
  IconLogOut, 
  IconMenu, 
  IconX,
  IconLayoutList,
  IconLayoutGrid,
  IconPanelRight,
  IconFilter,
  IconDownload,
  IconTrash
} from './Icons';

const Dashboard = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { section, projectTag } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active Navigation View ('inbox', 'today', 'upcoming', 'completed', 'board', or tag name) derived from URL
  const activeNav = useMemo(() => {
    if (projectTag) return `tag:${projectTag}`;
    if (section && ['inbox', 'today', 'upcoming', 'completed', 'board'].includes(section)) {
      return section;
    }
    return 'inbox';
  }, [section, projectTag]);

  // View Mode: board if on /app/board or ?view=board
  const viewMode = (section === 'board' || searchParams.get('view') === 'board') ? 'board' : 'list';

  // Search Query synchronized with URL search params
  const searchQuery = searchParams.get('q') || '';
  const setSearchQuery = (newQuery) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newQuery) next.set('q', newQuery);
      else next.delete('q');
      return next;
    }, { replace: true });
  };

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Daily Companion Panel & Filtering State (default open on >= 1140px, off-canvas on mobile/tablet)
  const [isCompanionVisible, setIsCompanionVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1140;
    }
    return true;
  });

  // Date Filter & Filter Pills synchronized with URL search params
  const selectedDateFilter = searchParams.get('date') || null;
  const setSelectedDateFilter = (newDate) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newDate) next.set('date', newDate);
      else next.delete('date');
      return next;
    }, { replace: true });
  };

  const activeFilterPill = searchParams.get('filter') || 'all';
  const setActiveFilterPill = (newPill) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (newPill && newPill !== 'all') next.set('filter', newPill);
      else next.delete('filter');
      return next;
    }, { replace: true });
  };

  // Declarative navigation handlers
  const handleNavigate = (targetNav) => {
    setIsMobileMenuOpen(false);
    const searchString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    if (targetNav.startsWith('tag:')) {
      const tag = targetNav.replace('tag:', '');
      navigate(`/app/project/${encodeURIComponent(tag)}${searchString}`);
    } else {
      navigate(`/app/${targetNav}${searchString}`);
    }
  };

  const handleSetViewMode = (mode) => {
    const search = new URLSearchParams(searchParams);
    if (mode === 'board') {
      search.delete('view');
      const searchStr = search.toString() ? `?${search.toString()}` : '';
      navigate(`/app/board${searchStr}`);
    } else {
      if (section === 'board') {
        const searchStr = search.toString() ? `?${search.toString()}` : '';
        navigate(`/app/inbox${searchStr}`);
      } else {
        search.delete('view');
        setSearchParams(search);
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    if (onLogout) onLogout();
    navigate('/login', { replace: true });
  };

  // Lightweight Avatar Profile Popover State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profilePopoverRef = useRef(null);
  const user = authService.getCurrentUser();
  const userInitials = (user?.username || 'U').substring(0, 2).toUpperCase();

  // Quick Task Creation Inline & Modal State
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newCategory, setNewCategory] = useState('Work');
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Theme Engine
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark';
  });

  const searchInputRef = useRef(null);
  const quickInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profilePopoverRef.current && 
        !profilePopoverRef.current.contains(e.target) && 
        !e.target.closest('.user-profile-trigger')
      ) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileOpen]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsProfileOpen(false);
      }

      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        if (window.innerWidth <= 768) {
          setIsTaskModalOpen(true);
        } else {
          quickInputRef.current?.focus();
        }
      } else if (e.key === '/' || (e.ctrlKey && e.key === 'k') || (e.metaKey && e.key === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const tasksData = await taskService.getTasks();
      setTasks(tasksData);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const taskPayload = {
        title: newTitle.trim(),
        priority: newPriority,
        category: newCategory,
        due_date: newDueDate ? new Date(newDueDate).toISOString() : null
      };

      const result = await taskService.createTask(taskPayload);
      setTasks(prev => [result.task, ...prev]);
      setNewTitle('');
      setNewDueDate('');
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleModalCreateTask = async (taskPayload) => {
    const result = await taskService.createTask(taskPayload);
    setTasks(prev => [result.task, ...prev]);
    return result;
  };

  const handleUpdateTask = async (taskId, updateData) => {
    try {
      setTasks(prev => prev.map(t => {
        if (t.id !== taskId) return t;
        const next = { ...t, ...updateData };
        if ('status' in updateData && !('completed' in updateData)) {
          next.completed = (updateData.status === 'done');
        } else if ('completed' in updateData && !('status' in updateData)) {
          if (updateData.completed) next.status = 'done';
          else if (t.status === 'done') next.status = 'todo';
        }
        return next;
      }));
      const result = await taskService.updateTask(taskId, updateData);
      setTasks(prev => prev.map(t => t.id === taskId ? result.task : t));
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to update task');
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await taskService.deleteTask(taskId);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to delete task');
      fetchTasks();
    }
  };

  // Date Preset Helpers for Quick-Add
  const setDueDateToday = () => {
    const d = new Date();
    d.setHours(18, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setNewDueDate(`${year}-${month}-${day}T18:00`);
  };

  const setDueDateTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setNewDueDate(`${year}-${month}-${day}T18:00`);
  };

  // Profile Popover Utility Handlers
  const handleExportTasks = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      user: user?.username,
      total_tasks: tasks.length,
      tasks: tasks
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `taskmanager-pro-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsProfileOpen(false);
  };

  const handleClearCompleted = async () => {
    const completedTasks = tasks.filter(t => t.completed);
    if (completedTasks.length === 0) return;
    if (window.confirm(`Permanently remove ${completedTasks.length} completed task${completedTasks.length === 1 ? '' : 's'}?`)) {
      try {
        for (const t of completedTasks) {
          await taskService.deleteTask(t.id);
        }
        setTasks(prev => prev.filter(t => !t.completed));
        setIsProfileOpen(false);
      } catch (err) {
        setError(err.response?.data?.error || err.response?.data?.msg || 'Failed to clear completed tasks');
      }
    }
  };

  // Compute Task Counts for Sidebar Nav
  const counts = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    let inboxCount = 0;
    let todayCount = 0;
    let upcomingCount = 0;
    let completedCount = 0;

    tasks.forEach(t => {
      if (t.completed) {
        completedCount++;
      } else {
        inboxCount++;
        if (t.due_date) {
          const due = new Date(t.due_date);
          if (due.toDateString() === todayStr) {
            todayCount++;
          } else if (due > now) {
            upcomingCount++;
          }
        }
      }
    });

    return { inbox: inboxCount, today: todayCount, upcoming: upcomingCount, completed: completedCount, board: tasks.length };
  }, [tasks]);

  // Filter Tasks based on Active Nav, Date Filter, Filter Pill, & Search
  const filteredTasks = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();

    return tasks.filter(task => {
      // Search text
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesCategory = (task.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory) return false;
      }

      // Nav View
      if (viewMode === 'board') {
        if (activeNav.startsWith('tag:')) {
          const tagName = activeNav.replace('tag:', '');
          if ((task.category || 'General').toLowerCase() !== tagName.toLowerCase()) return false;
        } else if (activeNav === 'today') {
          if (!task.due_date || new Date(task.due_date).toDateString() !== todayStr) return false;
        } else if (activeNav === 'upcoming') {
          if (!task.due_date || new Date(task.due_date) <= now || new Date(task.due_date).toDateString() === todayStr) return false;
        } else if (activeNav === 'completed') {
          if (!task.completed && task.status !== 'done') return false;
        }
        // for 'inbox' and 'board', all tasks across workflow stages are shown
      } else {
        if (activeNav === 'inbox') {
          if (task.completed) return false;
        } else if (activeNav === 'today') {
          if (task.completed || !task.due_date) return false;
          if (new Date(task.due_date).toDateString() !== todayStr) return false;
        } else if (activeNav === 'upcoming') {
          if (task.completed || !task.due_date) return false;
          if (new Date(task.due_date) <= now || new Date(task.due_date).toDateString() === todayStr) return false;
        } else if (activeNav === 'completed') {
          if (!task.completed) return false;
        } else if (activeNav.startsWith('tag:')) {
          const tagName = activeNav.replace('tag:', '');
          if (task.completed || (task.category || 'General').toLowerCase() !== tagName.toLowerCase()) return false;
        }
      }

      // Date Filter from Companion Week Strip
      if (selectedDateFilter) {
        if (!task.due_date || !task.due_date.startsWith(selectedDateFilter)) {
          return false;
        }
      }

      // Filter Pill
      if (activeFilterPill !== 'all') {
        if (activeFilterPill === 'urgent') {
          if (task.priority !== 'urgent') return false;
        } else if (activeFilterPill === 'high') {
          if (task.priority !== 'high') return false;
        } else {
          if ((task.category || '').toLowerCase() !== activeFilterPill.toLowerCase()) {
            return false;
          }
        }
      }

      return true;
    });
  }, [tasks, activeNav, viewMode, searchQuery, selectedDateFilter, activeFilterPill]);

  // Heading text
  const getNavTitle = () => {
    if (activeNav === 'inbox') return 'Inbox';
    if (activeNav === 'today') return 'Today';
    if (activeNav === 'upcoming') return 'Upcoming';
    if (activeNav === 'completed') return 'Completed';
    if (activeNav === 'board') return 'Board';
    if (activeNav.startsWith('tag:')) return `# ${activeNav.replace('tag:', '')}`;
    return 'Tasks';
  };

  // Subtitle Context Info
  const getSubTitle = () => {
    const today = new Date().toLocaleDateString(undefined, { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
    if (selectedDateFilter) {
      const parts = selectedDateFilter.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return `Filtered for ${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}`;
    }
    if (activeNav === 'board') return `${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'} across workflow columns`;
    if (activeNav === 'today') return `${today} • ${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'} due today`;
    if (activeNav === 'completed') return `${filteredTasks.length} completed task${filteredTasks.length === 1 ? '' : 's'}`;
    if (activeNav === 'upcoming') return `${filteredTasks.length} scheduled task${filteredTasks.length === 1 ? '' : 's'}`;
    if (counts.inbox === 0) return `${today} • All caught up`;
    return `${today} • ${counts.inbox} active task${counts.inbox === 1 ? '' : 's'}`;
  };

  return (
    <div className="workspace-layout">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setIsMobileMenuOpen(false)} 
        />
      )}

      {/* Left Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-glyph">P</div>
            <span>Task Manager Pro</span>
          </div>
          {isMobileMenuOpen && (
            <button 
              type="button" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="btn-icon-subtle"
            >
              <IconX size={16} />
            </button>
          )}
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">
            <span className="sidebar-section-title">Views</span>
            <button
              type="button"
              className={`nav-item ${activeNav === 'inbox' ? 'active' : ''}`}
              onClick={() => handleNavigate('inbox')}
            >
              <span className="nav-item-left">
                <IconInbox size={15} />
                Inbox
              </span>
              <span className="nav-count">{counts.inbox}</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeNav === 'today' ? 'active' : ''}`}
              onClick={() => handleNavigate('today')}
            >
              <span className="nav-item-left">
                <IconCalendar size={15} />
                Today
              </span>
              <span className="nav-count">{counts.today}</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeNav === 'upcoming' ? 'active' : ''}`}
              onClick={() => handleNavigate('upcoming')}
            >
              <span className="nav-item-left">
                <IconClock size={15} />
                Upcoming
              </span>
              <span className="nav-count">{counts.upcoming}</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeNav === 'board' ? 'active' : ''}`}
              onClick={() => handleNavigate('board')}
            >
              <span className="nav-item-left">
                <IconLayoutGrid size={15} />
                Board
              </span>
              <span className="nav-count">{counts.board}</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeNav === 'completed' ? 'active' : ''}`}
              onClick={() => handleNavigate('completed')}
            >
              <span className="nav-item-left">
                <IconCheckCircle size={15} />
                Completed
              </span>
              <span className="nav-count">{counts.completed}</span>
            </button>
          </div>

          <div className="sidebar-section">
            <span className="sidebar-section-title">Projects</span>
            {[
              { id: 'tag:Work', label: 'Work', color: '#3b82f6' },
              { id: 'tag:Personal', label: 'Personal', color: '#10b981' },
              { id: 'tag:Engineering', label: 'Engineering', color: '#8b5cf6' },
              { id: 'tag:Design', label: 'Design', color: '#f59e0b' }
            ].map(proj => (
              <button
                key={proj.id}
                type="button"
                className={`nav-item ${activeNav === proj.id ? 'active' : ''}`}
                onClick={() => handleNavigate(proj.id)}
              >
                <span className="nav-item-left">
                  <span className="tag-dot" style={{ backgroundColor: proj.color }} />
                  {proj.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className="user-profile-trigger"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            title="User Profile & Utilities"
            aria-expanded={isProfileOpen}
          >
            <div className="user-avatar-sm">{userInitials}</div>
            <span className="user-name-text">{user?.username || 'User'}</span>
          </button>

          <div className="footer-actions">
            <button
              type="button"
              onClick={toggleTheme}
              className="btn-icon-subtle"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-icon-subtle"
              title="Sign out"
              aria-label="Sign out"
            >
              <IconLogOut size={15} />
            </button>
          </div>

          {/* Lightweight Anchored Avatar Popover */}
          {isProfileOpen && (
            <div className="profile-popover" ref={profilePopoverRef}>
              <div className="popover-user-header">
                <div className="popover-avatar">{userInitials}</div>
                <div className="popover-user-info">
                  <div className="popover-username">{user?.username || 'User'}</div>
                  <div className="popover-email">{user?.email || 'Local Workspace'}</div>
                </div>
              </div>

              <div className="popover-divider" />

              <div className="popover-section-label">Workspace Utilities</div>
              <button 
                type="button" 
                className="popover-menu-item"
                onClick={handleExportTasks}
              >
                <IconDownload size={13} />
                <span>Export Tasks (JSON)</span>
              </button>

              {counts.completed > 0 && (
                <button 
                  type="button" 
                  className="popover-menu-item text-danger"
                  onClick={handleClearCompleted}
                >
                  <IconTrash size={13} />
                  <span>Clear Completed ({counts.completed})</span>
                </button>
              )}

              <div className="popover-divider" />

              <div className="popover-section-label">Theme</div>
              <div className="popover-theme-toggle">
                <button
                  type="button"
                  className={`popover-theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <IconMoon size={12} />
                  Dark
                </button>
                <button
                  type="button"
                  className={`popover-theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <IconSun size={12} />
                  Light
                </button>
              </div>

              <div className="popover-divider" />

              <button 
                type="button" 
                className="popover-menu-item"
                onClick={handleLogout}
              >
                <IconLogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="main-viewport">
        {/* Unified Responsive Topbar */}
        <div className="viewport-topbar">
          <div className="view-heading-group">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="btn-icon-subtle mobile-menu-btn"
              aria-label="Open sidebar menu"
              title="Open menu"
            >
              <IconMenu size={18} />
            </button>
            <h1 className="view-heading">{getNavTitle()}</h1>
            <span className="view-count-badge">{filteredTasks.length}</span>
            {!isOnline && (
              <div className="offline-pill" role="status" aria-live="polite">
                <span className="offline-dot"></span>
                <span>Offline (Cached)</span>
              </div>
            )}
          </div>

          <div className="topbar-controls">
            <div className="search-wrapper desktop-only-search">
              <IconSearch size={14} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search... (/)"
                className="search-field"
              />
            </div>

            <div className="segmented-view-switch">
              <button
                type="button"
                className={`segment-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => handleSetViewMode('list')}
                title="List View"
              >
                <IconLayoutList size={13} />
                <span className="segment-label">List</span>
              </button>
              <button
                type="button"
                className={`segment-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => handleSetViewMode('board')}
                title="Kanban Board View"
              >
                <IconLayoutGrid size={13} />
                <span className="segment-label">Board</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsCompanionVisible(!isCompanionVisible)}
              className={`btn-icon-subtle ${isCompanionVisible ? 'active-icon' : ''}`}
              title="Toggle Overview & Rhythm"
              aria-label="Toggle Overview & Rhythm"
            >
              <IconPanelRight size={15} />
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="btn-icon-subtle mobile-theme-btn"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>
          </div>
        </div>

        {/* Dual-Pane Center Row: Task Stream + Daily Companion */}
        <div className="workspace-center-row">
          {/* Focused Task Stream Body */}
          <main className="viewport-body">
            {/* Context Subtitle Bar */}
            <div className="context-header-bar">
              <span className="context-subtitle-text">{getSubTitle()}</span>
              {selectedDateFilter && (
                <button 
                  type="button" 
                  onClick={() => setSelectedDateFilter(null)}
                  className="btn-clear-date-tag"
                >
                  Clear date filter ✕
                </button>
              )}
            </div>

            {error && (
              <div className="auth-error-banner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{error}</span>
                <button 
                  type="button" 
                  onClick={() => setError('')} 
                  style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
            )}

            {/* Frictionless Inline Quick-Add Task Input (Desktop Only) */}
            <form onSubmit={handleQuickCreate} className="quick-add-container desktop-only-quick-add">
              <div className="quick-add-main-row">
                <IconPlus size={16} />
                <input
                  ref={quickInputRef}
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Add a new task... (Press Enter to save)"
                  className="quick-add-input"
                />
              </div>

              {newTitle.trim() && (
                <div className="quick-add-options-row">
                  <div className="quick-selectors">
                    <div className="selector-chip-wrapper">
                      <span className={`prio-dot-indicator prio-dot-${newPriority}`} />
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="selector-select"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="selector-select"
                    >
                      <option value="Work">Work</option>
                      <option value="Personal">Personal</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="General">General</option>
                    </select>

                    <div className="date-preset-buttons">
                      <button 
                        type="button" 
                        onClick={setDueDateToday}
                        className="date-preset-btn"
                      >
                        Today
                      </button>
                      <button 
                        type="button" 
                        onClick={setDueDateTomorrow}
                        className="date-preset-btn"
                      >
                        Tomorrow
                      </button>
                      <input
                        type="datetime-local"
                        value={newDueDate}
                        onChange={(e) => setNewDueDate(e.target.value)}
                        className="selector-date"
                        title="Set Due Date"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="btn-submit-quick"
                  >
                    {isCreating ? 'Adding...' : 'Add ↵'}
                  </button>
                </div>
              )}
            </form>

            {/* Mobile Navigation & Full-Width Search Bar (Replaces top add bar on small screens) */}
            <div className="mobile-search-nav-container">
              <div className="mobile-search-bar">
                <IconSearch size={15} className="mobile-search-icon" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="mobile-search-input"
                />
                {searchQuery && (
                  <button 
                    type="button" 
                    onClick={() => setSearchQuery('')}
                    className="mobile-search-clear"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Horizontal Scrollable View & Project Switcher */}
              <div className="mobile-nav-chips-bar">
                {[
                  { id: 'inbox', label: 'Inbox', count: counts.inbox, icon: <IconInbox size={12} /> },
                  { id: 'today', label: 'Today', count: counts.today, icon: <IconCalendar size={12} /> },
                  { id: 'upcoming', label: 'Upcoming', count: counts.upcoming, icon: <IconClock size={12} /> },
                  { id: 'completed', label: 'Done', count: counts.completed, icon: <IconCheckCircle size={12} /> },
                  { id: 'tag:Work', label: 'Work', dot: '#3b82f6' },
                  { id: 'tag:Personal', label: 'Personal', dot: '#10b981' },
                  { id: 'tag:Engineering', label: 'Engineering', dot: '#8b5cf6' },
                  { id: 'tag:Design', label: 'Design', dot: '#f59e0b' }
                ].map(nav => (
                  <button
                    key={nav.id}
                    type="button"
                    className={`mobile-nav-chip ${activeNav === nav.id ? 'active' : ''}`}
                    onClick={() => handleNavigate(nav.id)}
                  >
                    {nav.icon && <span className="mobile-nav-chip-icon">{nav.icon}</span>}
                    {nav.dot && <span className="tag-dot" style={{ backgroundColor: nav.dot }} />}
                    <span>{nav.label}</span>
                    {typeof nav.count === 'number' && (
                      <span className="mobile-nav-chip-count">{nav.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Filter Strip (1-Click Slicing) */}
            <div className="quick-filter-strip">
              {[
                { id: 'all', label: 'All' },
                { id: 'urgent', label: '🔴 Urgent' },
                { id: 'high', label: '🟠 High' },
                { id: 'Work', label: 'Work' },
                { id: 'Personal', label: 'Personal' },
                { id: 'Engineering', label: 'Engineering' },
                { id: 'Design', label: 'Design' }
              ].map(pill => (
                <button
                  key={pill.id}
                  type="button"
                  className={`filter-pill-btn ${activeFilterPill === pill.id ? 'active' : ''}`}
                  onClick={() => setActiveFilterPill(activeFilterPill === pill.id ? 'all' : pill.id)}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Task Stream Collection */}
            {loading && tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Loading workspace...
              </div>
            ) : (
              <TaskList
                tasks={filteredTasks}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                viewMode={viewMode}
                activeNav={activeNav}
              />
            )}
          </main>

          {/* Right Daily Companion Panel / Drawer */}
          {isCompanionVisible && (
            <>
              <div 
                className="companion-backdrop" 
                onClick={() => setIsCompanionVisible(false)}
                aria-hidden="true" 
              />
              <DailyCompanion
                tasks={tasks}
                selectedDateFilter={selectedDateFilter}
                onSelectDate={(d) => setSelectedDateFilter(d)}
                onClearDateFilter={() => setSelectedDateFilter(null)}
                onClose={() => setIsCompanionVisible(false)}
              />
            </>
          )}
        </div>
      </div>

      {/* Floating Action Button (Hovering button on bottom right for phone and smaller screens) */}
      <button
        type="button"
        onClick={() => setIsTaskModalOpen(true)}
        className="mobile-fab-btn"
        title="Add new task"
        aria-label="Add new task"
      >
        <IconPlus size={24} />
      </button>

      {/* New Task Popup Modal Window */}
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleModalCreateTask}
        defaultCategory={activeNav.startsWith('tag:') ? activeNav.replace('tag:', '') : 'Work'}
      />
    </div>
  );
};

export default Dashboard;