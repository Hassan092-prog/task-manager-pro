import React, { useState } from 'react';
import { IconCheckCircle, IconEdit, IconTrash, IconClock, IconX } from './Icons';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editCategory, setEditCategory] = useState(task.category || 'General');
  const [editDueDate, setEditDueDate] = useState(task.due_date ? task.due_date.substring(0, 16) : '');

  const handleToggle = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdate(task.id, {
      title: editTitle.trim(),
      priority: editPriority,
      category: editCategory,
      due_date: editDueDate ? new Date(editDueDate).toISOString() : null
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority || 'medium');
    setEditCategory(task.category || 'General');
    setEditDueDate(task.due_date ? task.due_date.substring(0, 16) : '');
    setIsEditing(false);
  };

  // Format relative due date cleanly
  const formatDue = (dateStr, completed) => {
    if (!dateStr) return null;
    const due = new Date(dateStr);
    const now = new Date();
    const isPast = due < now;
    const isToday = due.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = due.toDateString() === tomorrow.toDateString();

    const dateFormatted = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

    if (completed) {
      return { text: dateFormatted, className: 'date-indicator' };
    }
    if (isPast && !isToday) {
      return { text: `Overdue (${dateFormatted})`, className: 'date-indicator overdue' };
    }
    if (isToday) {
      return { text: 'Today', className: 'date-indicator today' };
    }
    if (isTomorrow) {
      return { text: 'Tomorrow', className: 'date-indicator' };
    }
    return { text: dateFormatted, className: 'date-indicator' };
  };

  const due = formatDue(task.due_date, task.completed);
  const prioClass = `prio-dot-${task.priority || 'medium'}`;

  return (
    <div className={`task-row ${task.completed ? 'is-done' : ''}`}>
      <button
        type="button"
        onClick={handleToggle}
        className={`task-check-circle ${task.completed ? 'checked' : ''}`}
        aria-label={task.completed ? "Mark pending" : "Mark completed"}
      >
        {task.completed && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {!isEditing ? (
        <>
          <div className="task-row-main">
            <span className="task-row-title">{task.title}</span>
            {task.description && (
              <span className="task-row-desc">{task.description}</span>
            )}
          </div>

          <div className="task-row-meta">
            {task.category && task.category !== 'General' && (
              <span className="tag-badge">{task.category}</span>
            )}

            {due && (
              <span className={due.className}>
                <IconClock size={12} />
                {due.text}
              </span>
            )}

            <span 
              className={`prio-dot-indicator ${prioClass}`} 
              title={`Priority: ${task.priority || 'medium'}`} 
            />
          </div>

          <div className="task-row-actions">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="btn-icon-subtle btn-action-edit"
              title="Edit task"
              aria-label="Edit task"
            >
              <IconEdit size={14} />
            </button>
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="btn-icon-subtle btn-action-delete"
              title="Delete task"
              aria-label="Delete task"
            >
              <IconTrash size={14} />
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={handleSave} className="task-edit-row">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="task-edit-input"
            required
            autoFocus
          />
          <div className="task-edit-controls">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value)}
              className="selector-select"
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <input
              type="text"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              className="selector-select"
              placeholder="Tag"
              style={{ width: '85px' }}
            />
            <input
              type="datetime-local"
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="selector-date"
            />
            <button type="button" onClick={handleCancel} className="btn-xs-action">
              Cancel
            </button>
            <button type="submit" className="btn-xs-action primary">
              Save
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TaskItem;