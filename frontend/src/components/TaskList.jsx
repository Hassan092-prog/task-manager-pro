import React, { useState } from 'react';
import TaskItem from './TaskItem';
import { IconInbox, IconClock, IconCheckCircle, IconTrash, IconEdit } from './Icons';

const BoardTaskCard = ({ task, onUpdateTask, onDeleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');

  const startEditing = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority || 'medium');
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdateTask(task.id, {
      title: editTitle.trim(),
      priority: editPriority
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="board-task-card" style={{ gap: '0.4rem' }}>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="task-edit-input"
          autoFocus
          required
        />
        <div className="task-edit-controls">
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            className="selector-select"
          >
            <option value="urgent">🔴 Urgent</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🔵 Low</option>
          </select>
          <button type="button" onClick={() => setIsEditing(false)} className="btn-xs-action">
            Cancel
          </button>
          <button type="submit" className="btn-xs-action primary">
            Save
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className={`board-task-card ${task.completed ? 'is-done' : ''}`}>
      <div className="board-task-top">
        <button
          type="button"
          onClick={() => onUpdateTask(task.id, { completed: !task.completed })}
          className={`task-check-circle ${task.completed ? 'checked' : ''}`}
          aria-label="Toggle completed"
        >
          {task.completed && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <span className="board-task-title">{task.title}</span>
      </div>

      <div className="board-task-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          {task.category && task.category !== 'General' && (
            <span className="tag-badge">{task.category}</span>
          )}
          <span className={`prio-dot-indicator prio-dot-${task.priority || 'medium'}`} />
        </div>
        <div className="board-task-actions">
          <button
            type="button"
            onClick={startEditing}
            className="btn-icon-subtle btn-action-edit"
            title="Edit task"
            aria-label="Edit task"
          >
            <IconEdit size={13} />
          </button>
          <button
            type="button"
            onClick={() => onDeleteTask(task.id)}
            className="btn-icon-subtle btn-action-delete"
            title="Delete task"
            aria-label="Delete task"
          >
            <IconTrash size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, viewMode = 'list', activeNav = 'inbox' }) => {
  if (tasks.length === 0) {
    const getEmptyInfo = () => {
      if (activeNav === 'inbox') {
        return {
          title: 'Inbox Zero',
          desc: 'All clear. No pending items in your inbox. Press N or type above to create one.',
          icon: <IconInbox size={22} />
        };
      }
      if (activeNav === 'today') {
        return {
          title: 'Nothing due today',
          desc: 'Enjoy the calm or use the quick-add bar above to plan upcoming tasks.',
          icon: <IconClock size={22} />
        };
      }
      if (activeNav === 'upcoming') {
        return {
          title: 'No upcoming tasks',
          desc: 'You have no tasks scheduled for future dates.',
          icon: <IconClock size={22} />
        };
      }
      if (activeNav === 'completed') {
        return {
          title: 'No completed tasks yet',
          desc: 'Finished tasks will be cleanly archived and listed here.',
          icon: <IconCheckCircle size={22} />
        };
      }
      if (activeNav === 'board') {
        return {
          title: 'No tasks on board',
          desc: 'Create tasks to organize them across Kanban columns.',
          icon: <IconInbox size={22} />
        };
      }
      return {
        title: 'No tasks found',
        desc: 'No tasks match your current view or filter selection.',
        icon: <IconInbox size={22} />
      };
    };

    const emptyInfo = getEmptyInfo();

    return (
      <div className="quiet-empty-state">
        <div className="quiet-empty-icon-wrapper">
          {emptyInfo.icon}
        </div>
        <div className="quiet-empty-title">{emptyInfo.title}</div>
        <div className="quiet-empty-desc">{emptyInfo.desc}</div>
      </div>
    );
  }

  // Kanban Board View Mode
  if (viewMode === 'board') {
    const todoTasks = tasks.filter(t => !t.completed && t.priority !== 'urgent' && t.priority !== 'high');
    const priorityTasks = tasks.filter(t => !t.completed && (t.priority === 'urgent' || t.priority === 'high'));
    const completedTasks = tasks.filter(t => t.completed);

    const columns = [
      { id: 'todo', title: 'To Do', count: todoTasks.length, items: todoTasks },
      { id: 'priority', title: 'In Progress / Priority', count: priorityTasks.length, items: priorityTasks },
      { id: 'completed', title: 'Done', count: completedTasks.length, items: completedTasks }
    ];

    return (
      <div className="board-columns">
        {columns.map(col => (
          <div key={col.id} className="board-column">
            <div className="board-col-head">
              <span>{col.title}</span>
              <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{col.count}</span>
            </div>
            <div className="board-col-tasks">
              {col.items.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Empty
                </div>
              ) : (
                col.items.map(task => (
                  <BoardTaskCard
                    key={task.id}
                    task={task}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                  />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Standard Linear List View Mode
  return (
    <div className="tasks-group">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
        />
      ))}
      <div className="tasks-group-footer">
        <span>{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
      </div>
    </div>
  );
};

export default TaskList;