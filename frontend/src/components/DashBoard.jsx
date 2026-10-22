import React, { useState, useEffect, useMemo, useRef } from 'react';
import { taskService } from '../services/tasks';
import { authService } from '../services/auth';
import TaskList from './TaskList';
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
  IconLayoutGrid
} from './Icons';

const Dashboard = ({ onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Active Navigation View ('inbox', 'today', 'upcoming', 'completed', or tag name)
  const [activeNav, setActiveNav] = useState('inbox');
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'board'
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Quick Task Creation Inline State
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('medium');
  const [newCategory, setNewCategory] = useState('Work');
  const [newDueDate, setNewDueDate] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        quickInputRef.current?.focus();
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
      setError(err.response?.data?.error || 'Failed to load tasks.');
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
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTask = async (taskId, updateData) => {
    try {
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updateData } : t));
      const result = await taskService.updateTask(taskId, updateData);
      setTasks(prev => prev.map(t => t.id === taskId ? result.task : t));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update task');
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await taskService.deleteTask(taskId);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete task');
      fetchTasks();
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

    return { inbox: inboxCount, today: todayCount, upcoming: upcomingCount, completed: completedCount };
  }, [tasks]);

  // Filter Tasks based on Active Nav & Search
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
      if (activeNav === 'inbox') {
        return !task.completed;
      }
      if (activeNav === 'today') {
        if (task.completed || !task.due_date) return false;
        return new Date(task.due_date).toDateString() === todayStr;
      }
      if (activeNav === 'upcoming') {
        if (task.completed || !task.due_date) return false;
        return new Date(task.due_date) > now && new Date(task.due_date).toDateString() !== todayStr;
      }
      if (activeNav === 'completed') {
        return task.completed;
      }
      // If activeNav is a specific category tag
      if (activeNav.startsWith('tag:')) {
        const tagName = activeNav.replace('tag:', '');
        return !task.completed && (task.category || 'General').toLowerCase() === tagName.toLowerCase();
      }

      return true;
    });
  }, [tasks, activeNav, searchQuery]);

  const user = authService.getCurrentUser();
  const userInitials = (user?.username || 'U').substring(0, 2).toUpperCase();

  // Heading text
  const getNavTitle = () => {
    if (activeNav === 'inbox') return 'Inbox';
    if (activeNav === 'today') return 'Today';
    if (activeNav === 'upcoming') return 'Upcoming';
    if (activeNav === 'completed') return 'Completed';
    if (activeNav.startsWith('tag:')) return `# ${activeNav.replace('tag:', '')}`;
    return 'Tasks';
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
              onClick={() => { setActiveNav('inbox'); setIsMobileMenuOpen(false); }}
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
              onClick={() => { setActiveNav('today'); setIsMobileMenuOpen(false); }}
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
              onClick={() => { setActiveNav('upcoming'); setIsMobileMenuOpen(false); }}
            >
              <span className="nav-item-left">
                <IconClock size={15} />
                Upcoming
              </span>
              <span className="nav-count">{counts.upcoming}</span>
            </button>

            <button
              type="button"
              className={`nav-item ${activeNav === 'completed' ? 'active' : ''}`}
              onClick={() => { setActiveNav('completed'); setIsMobileMenuOpen(false); }}
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
                onClick={() => { setActiveNav(proj.id); setIsMobileMenuOpen(false); }}
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
          <div className="user-snippet">
            <div className="user-avatar-sm">{userInitials}</div>
            <span className="user-name-text">{user?.username}</span>
          </div>

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
              onClick={onLogout}
              className="btn-icon-subtle"
              title="Sign out"
              aria-label="Sign out"
            >
              <IconLogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="main-viewport">
        {/* Mobile App Bar */}
        <div className="mobile-appbar">
          <div className="mobile-appbar-left">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="btn-icon-subtle"
              aria-label="Open menu"
            >
              <IconMenu size={18} />
            </button>
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{getNavTitle()}</span>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="btn-icon-subtle"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <IconSun size={16} /> : <IconMoon size={16} />}
          </button>
        </div>

        {/* Desktop Viewport Topbar */}
        <div className="viewport-topbar">
          <div className="view-heading-group">
            <h1 className="view-heading">{getNavTitle()}</h1>
            <span className="view-count-badge">{filteredTasks.length}</span>
          </div>

          <div className="topbar-controls">
            <div className="search-wrapper">
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
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <IconLayoutList size={13} />
                List
              </button>
              <button
                type="button"
                className={`segment-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => setViewMode('board')}
                title="Kanban Board View"
              >
                <IconLayoutGrid size={13} />
                Board
              </button>
            </div>
          </div>
        </div>

        {/* Viewport Body */}
        <div className="viewport-body">
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

          {/* Frictionless Inline Quick-Add Task Input (Things 3 / Todoist style) */}
          <form onSubmit={handleQuickCreate} className="quick-add-container">
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

                  <input
                    type="datetime-local"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="selector-date"
                    title="Set Due Date"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-submit-quick"
                >
                  {isCreating ? 'Adding...' : 'Add'}
                </button>
              </div>
            )}
          </form>

          {/* Task Collection */}
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
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;