import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  IconSearch,
  IconInbox,
  IconCalendar,
  IconClock,
  IconCheckCircle,
  IconLayoutGrid,
  IconTag,
  IconPlus,
  IconSun,
  IconMoon,
  IconPanelRight,
  IconTrash
} from './Icons';
import './CommandPalette.css';

const CommandPalette = ({
  isOpen,
  onClose,
  tasks = [],
  navigate,
  onToggleCompanion,
  onToggleTheme,
  onNewTask,
  onClearCompleted,
  theme = 'dark'
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const resultsRef = useRef(null);
  const backdropRef = useRef(null);

  // Reset query and focus when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 20);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Prevent background scrolling while Command Palette is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Derive unique project categories from existing tasks
  const projectCategories = useMemo(() => {
    const categoriesSet = new Set();
    tasks.forEach(task => {
      const cat = (task.category || '').trim();
      if (cat && cat.toLowerCase() !== 'general') {
        categoriesSet.add(cat);
      }
    });
    return Array.from(categoriesSet).sort();
  }, [tasks]);

  // Define static Navigation options
  const navigationItems = useMemo(() => {
    const baseItems = [
      {
        id: 'nav-inbox',
        label: 'Go to Inbox',
        section: 'Navigation',
        icon: <IconInbox size={15} />,
        shortcut: 'G I',
        perform: () => navigate('inbox')
      },
      {
        id: 'nav-today',
        label: 'Go to Today',
        section: 'Navigation',
        icon: <IconCalendar size={15} />,
        shortcut: 'G T',
        perform: () => navigate('today')
      },
      {
        id: 'nav-upcoming',
        label: 'Go to Upcoming',
        section: 'Navigation',
        icon: <IconClock size={15} />,
        shortcut: 'G U',
        perform: () => navigate('upcoming')
      },
      {
        id: 'nav-completed',
        label: 'Go to Completed',
        section: 'Navigation',
        icon: <IconCheckCircle size={15} />,
        shortcut: 'G C',
        perform: () => navigate('completed')
      },
      {
        id: 'nav-board',
        label: 'Go to Kanban Board',
        section: 'Navigation',
        icon: <IconLayoutGrid size={15} />,
        shortcut: 'G B',
        perform: () => navigate('board')
      }
    ];

    const projectItems = projectCategories.map(cat => ({
      id: `nav-project-${cat}`,
      label: `Project: ${cat}`,
      section: 'Navigation',
      icon: <IconTag size={15} />,
      perform: () => navigate(`tag:${cat}`)
    }));

    return [...baseItems, ...projectItems];
  }, [projectCategories, navigate]);

  // Define Quick Actions
  const actionItems = useMemo(() => [
    {
      id: 'act-new-task',
      label: 'Create New Task',
      section: 'Quick Actions',
      icon: <IconPlus size={15} />,
      shortcut: 'N',
      perform: () => onNewTask()
    },
    {
      id: 'act-toggle-theme',
      label: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      section: 'Quick Actions',
      icon: theme === 'dark' ? <IconSun size={15} /> : <IconMoon size={15} />,
      perform: () => onToggleTheme()
    },
    {
      id: 'act-toggle-companion',
      label: 'Toggle Daily Companion Panel',
      section: 'Quick Actions',
      icon: <IconPanelRight size={15} />,
      perform: () => onToggleCompanion()
    },
    {
      id: 'act-clear-completed',
      label: 'Clear Completed Tasks',
      section: 'Quick Actions',
      icon: <IconTrash size={15} />,
      perform: () => onClearCompleted()
    }
  ], [theme, onNewTask, onToggleTheme, onToggleCompanion, onClearCompleted]);

  // Convert tasks into searchable items (max 6 matches, prioritizing active tasks on empty query)
  const taskSearchItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    let matchedTasks = tasks;
    if (q) {
      matchedTasks = tasks.filter(t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.category || '').toLowerCase().includes(q)
      );
    } else {
      matchedTasks = [...tasks].sort((a, b) => {
        if (a.completed === b.completed) return 0;
        return a.completed ? 1 : -1;
      });
    }
    return matchedTasks.slice(0, 6).map(t => ({
      id: `task-${t.id}`,
      label: t.title,
      section: 'Tasks',
      icon: <IconCheckCircle size={15} className={t.completed ? 'task-done-icon' : ''} />,
      priority: t.priority,
      category: t.category,
      completed: t.completed,
      perform: () => {
        if (t.completed) {
          navigate('completed');
        } else if (t.status === 'in_progress') {
          navigate('board');
        } else if (t.category && t.category.toLowerCase() !== 'general') {
          navigate(`tag:${t.category}`);
        } else {
          navigate('inbox');
        }
      }
    }));
  }, [tasks, query, navigate]);

  // Filter items based on query
  const { filteredSections, flatItems } = useMemo(() => {
    const q = query.trim().toLowerCase();

    let navList = navigationItems;
    let actList = actionItems;

    if (q) {
      navList = navigationItems.filter(item =>
        item.label.toLowerCase().includes(q)
      );
      actList = actionItems.filter(item =>
        item.label.toLowerCase().includes(q)
      );
    }

    const sections = [];
    if (navList.length > 0) {
      sections.push({ title: 'Navigation', items: navList });
    }
    if (actList.length > 0) {
      sections.push({ title: 'Quick Actions', items: actList });
    }
    if (taskSearchItems.length > 0) {
      sections.push({ title: 'Tasks', items: taskSearchItems });
    }

    const flat = sections.flatMap(sec => sec.items);
    return { filteredSections: sections, flatItems: flat };
  }, [query, navigationItems, actionItems, taskSearchItems]);

  // Keep selection within bounds
  useEffect(() => {
    setSelectedIndex(prev => {
      if (flatItems.length === 0) return 0;
      return Math.min(prev, flatItems.length - 1);
    });
  }, [flatItems.length]);

  // Scroll active item into view
  useEffect(() => {
    if (!resultsRef.current || flatItems.length === 0) return;
    const activeEl = resultsRef.current.querySelector('[aria-selected="true"]');
    if (activeEl && typeof activeEl.scrollIntoView === 'function') {
      activeEl.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex, flatItems]);

  if (!isOpen) return null;

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (flatItems.length > 0 ? (prev + 1) % flatItems.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (flatItems.length > 0 ? (prev - 1 + flatItems.length) % flatItems.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const currentItem = flatItems[selectedIndex];
      if (currentItem) {
        currentItem.perform();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Tab') {
      e.preventDefault(); // Keep focus trapped in search input
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  let globalItemIndex = 0;

  return (
    <div
      ref={backdropRef}
      className="palette-backdrop"
      onClick={handleBackdropClick}
      data-testid="command-palette-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
    >
      <div className="palette-dialog" onClick={e => e.stopPropagation()}>
        {/* Search Input Bar */}
        <div className="palette-header">
          <span className="palette-search-icon" aria-hidden="true">
            <IconSearch size={18} />
          </span>
          <input
            ref={inputRef}
            type="text"
            className="palette-input"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search tasks..."
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="palette-results-list"
            aria-activedescendant={flatItems[selectedIndex] ? `palette-item-${flatItems[selectedIndex].id}` : undefined}
          />
          <kbd className="palette-esc-badge" title="Close command palette">ESC</kbd>
        </div>

        {/* Results Listbox */}
        <div
          ref={resultsRef}
          id="palette-results-list"
          className="palette-results"
          role="listbox"
          aria-label="Commands and suggestions"
        >
          {flatItems.length === 0 ? (
            <div className="palette-empty-state">
              No commands or tasks matching "{query}"
            </div>
          ) : (
            filteredSections.map(section => (
              <div key={section.title} className="palette-section">
                <div className="palette-section-title">{section.title}</div>
                {section.items.map(item => {
                  const itemIndex = globalItemIndex++;
                  const isSelected = itemIndex === selectedIndex;

                  return (
                    <div
                      key={item.id}
                      id={`palette-item-${item.id}`}
                      role="option"
                      aria-selected={isSelected}
                      className={`palette-item ${isSelected ? 'is-selected' : ''}`}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      onClick={() => {
                        item.perform();
                        onClose();
                      }}
                    >
                      <div className="palette-item-left">
                        <span className="palette-item-icon" aria-hidden="true">
                          {item.icon}
                        </span>
                        <span className={`palette-item-label ${item.completed ? 'palette-task-done' : ''}`}>{item.label}</span>
                      </div>

                      <div className="palette-item-right">
                        {item.shortcut && (
                          <kbd className="palette-kbd">{item.shortcut}</kbd>
                        )}
                        {item.category && item.category !== 'General' && (
                          <span className="palette-tag-badge">{item.category}</span>
                        )}
                        {item.priority && item.priority !== 'medium' && (
                          <span className={`prio-dot-indicator prio-dot-${item.priority}`} title={`Priority: ${item.priority}`} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Keyboard Navigation Guidance Footer */}
        <div className="palette-footer" aria-hidden="true">
          <span className="palette-footer-item">
            <kbd>↑</kbd><kbd>↓</kbd> Navigate
          </span>
          <span className="palette-footer-item">
            <kbd>↵</kbd> Select
          </span>
          <span className="palette-footer-item">
            <kbd>esc</kbd> Dismiss
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
