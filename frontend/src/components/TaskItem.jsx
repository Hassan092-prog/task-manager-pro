import React, { useState, useRef } from 'react';
import { 
  IconCheckCircle, 
  IconEdit, 
  IconTrash, 
  IconClock, 
  IconX, 
  IconListTodo, 
  IconChevronDown, 
  IconChevronRight 
} from './Icons';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const subtaskInputRef = useRef(null);

  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editCategory, setEditCategory] = useState(task.category || 'General');
  const [editStatus, setEditStatus] = useState(task.completed ? 'done' : (task.status || 'todo'));
  const [editDueDate, setEditDueDate] = useState(task.due_date ? task.due_date.substring(0, 16) : '');

  // Touch Swipe Gesture State
  const [swipeOffset, setSwipeOffset] = useState(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isSwipingRef = useRef(false);
  const axisLockedRef = useRef(null);

  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const totalSubtasks = subtasks.length;

  const startEditing = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority || 'medium');
    setEditCategory(task.category || 'General');
    setEditStatus(task.completed ? 'done' : (task.status || 'todo'));
    setEditDueDate(task.due_date ? task.due_date.substring(0, 16) : '');
    setIsEditing(true);
  };

  const handleToggle = () => {
    const nextCompleted = !task.completed;
    onUpdate(task.id, {
      completed: nextCompleted,
      status: nextCompleted ? 'done' : 'todo'
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdate(task.id, {
      title: editTitle.trim(),
      priority: editPriority,
      category: editCategory,
      status: editStatus,
      completed: editStatus === 'done',
      due_date: editDueDate ? new Date(editDueDate).toISOString() : null
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority || 'medium');
    setEditCategory(task.category || 'General');
    setEditStatus(task.completed ? 'done' : (task.status || 'todo'));
    setEditDueDate(task.due_date ? task.due_date.substring(0, 16) : '');
    setIsEditing(false);
  };

  // Subtask Handlers
  const handleToggleSubtask = (subtaskId) => {
    const nextSubtasks = subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    onUpdate(task.id, { subtasks: nextSubtasks });
  };

  const handleDeleteSubtask = (subtaskId) => {
    const nextSubtasks = subtasks.filter(s => s.id !== subtaskId);
    onUpdate(task.id, { subtasks: nextSubtasks });
  };

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSubtask = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'sub_' + Date.now(),
      title: newSubtaskTitle.trim(),
      completed: false
    };
    const nextSubtasks = [...subtasks, newSubtask];
    onUpdate(task.id, { subtasks: nextSubtasks });
    setNewSubtaskTitle('');
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

  const handleTouchStart = (e) => {
    if (isEditing) return;
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    isSwipingRef.current = true;
    axisLockedRef.current = null;
  };

  const handleTouchMove = (e) => {
    if (!isSwipingRef.current || isEditing) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartXRef.current;
    const dy = touch.clientY - touchStartYRef.current;

    if (axisLockedRef.current === null) {
      if (Math.hypot(dx, dy) > 8) {
        if (Math.abs(dy) >= Math.abs(dx)) {
          axisLockedRef.current = 'vertical';
          isSwipingRef.current = false;
          setSwipeOffset(0);
          return;
        } else {
          axisLockedRef.current = 'horizontal';
        }
      }
    }

    if (axisLockedRef.current === 'horizontal') {
      let clamped = dx;
      if (dx > 85) clamped = 85 + (dx - 85) * 0.25;
      if (dx < -85) clamped = -85 + (dx + 85) * 0.25;
      setSwipeOffset(clamped);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwipingRef.current || isEditing) {
      isSwipingRef.current = false;
      setSwipeOffset(0);
      return;
    }
    isSwipingRef.current = false;
    if (axisLockedRef.current === 'horizontal') {
      if (swipeOffset >= 75) {
        handleToggle();
      } else if (swipeOffset <= -75) {
        onDelete(task.id);
      }
    }
    setSwipeOffset(0);
    axisLockedRef.current = null;
  };

  const handleTouchCancel = () => {
    isSwipingRef.current = false;
    setSwipeOffset(0);
    axisLockedRef.current = null;
  };

  const due = formatDue(task.due_date, task.completed);
  const prioClass = `prio-dot-${task.priority || 'medium'}`;

  return (
    <div 
      className={`task-item-container ${task.completed ? 'is-done' : ''}`}
      data-testid={`task-item-${task.id}`}
    >
      {/* Mobile Swipe Action Indicators Background */}
      <div className="task-swipe-bg" aria-hidden="true">
        <div className={`swipe-indicator swipe-left ${swipeOffset > 25 ? 'visible' : ''}`}>
          <IconCheckCircle size={16} />
          <span>{task.completed ? 'Pending' : 'Done'}</span>
        </div>
        <div className={`swipe-indicator swipe-right ${swipeOffset < -25 ? 'visible' : ''}`}>
          <span>Delete</span>
          <IconTrash size={16} />
        </div>
      </div>

      <div 
        className={`task-row ${task.completed ? 'is-done' : ''}`}
        style={swipeOffset !== 0 ? { transform: `translateX(${swipeOffset}px)`, transition: 'none' } : undefined}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
      >
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
              {totalSubtasks > 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`subtasks-badge ${completedSubtasks === totalSubtasks ? 'all-done' : ''}`}
                  title={`${completedSubtasks} of ${totalSubtasks} subtasks completed (click to toggle)`}
                  aria-label={`Toggle ${totalSubtasks} subtasks`}
                >
                  <IconListTodo size={11} />
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                  {isExpanded ? <IconChevronDown size={10} /> : <IconChevronRight size={10} />}
                </button>
              )}

              {task.status === 'in_progress' && !task.completed && (
                <span className="status-badge in-progress">In Progress</span>
              )}

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
                onClick={() => {
                  setIsExpanded(true);
                  setTimeout(() => subtaskInputRef.current?.focus(), 50);
                }}
                className="btn-icon-subtle btn-action-subtask"
                title="Add checklist item"
                aria-label="Add checklist item"
              >
                <IconListTodo size={14} />
              </button>
              <button
                type="button"
                onClick={startEditing}
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
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="selector-select"
                aria-label="Edit status"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
              <select
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value)}
                className="selector-select"
                aria-label="Edit priority"
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

      {isExpanded && !isEditing && (
        <div className="subtasks-container" data-testid={`subtasks-container-${task.id}`}>
          {subtasks.map(st => (
            <div key={st.id} className={`subtask-item ${st.completed ? 'is-completed' : ''}`}>
              <button
                type="button"
                onClick={() => handleToggleSubtask(st.id)}
                className={`subtask-checkbox ${st.completed ? 'checked' : ''}`}
                aria-label={st.completed ? `Mark subtask ${st.title} incomplete` : `Mark subtask ${st.title} complete`}
              >
                {st.completed && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
              <span className="subtask-title">{st.title}</span>
              <button
                type="button"
                onClick={() => handleDeleteSubtask(st.id)}
                className="btn-icon-subtle btn-subtask-delete"
                title="Delete subtask"
                aria-label={`Delete subtask ${st.title}`}
              >
                <IconX size={12} />
              </button>
            </div>
          ))}
          <form onSubmit={handleAddSubtask} className="subtask-add-row">
            <input
              ref={subtaskInputRef}
              type="text"
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="+ Add subtask..."
              className="subtask-add-input"
            />
            {newSubtaskTitle.trim() && (
              <button type="submit" className="btn-xs-action primary">
                Add
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default TaskItem;
