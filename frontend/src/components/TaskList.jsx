import React, { useState } from 'react';
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TaskItem from './TaskItem';
import { IconInbox, IconClock, IconCheckCircle, IconTrash, IconEdit, IconListTodo } from './Icons';

// Format relative due date helper
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

export const BoardTaskCard = ({
  task,
  onUpdateTask,
  onDeleteTask,
  isOverlay = false,
  isDragging = false,
  isEditing: externalIsEditing,
  setIsEditing: externalSetIsEditing
}) => {
  const [internalIsEditing, setInternalIsEditing] = useState(false);
  const isEditing = externalIsEditing !== undefined ? externalIsEditing : internalIsEditing;
  const setIsEditing = externalSetIsEditing || setInternalIsEditing;

  const [editTitle, setEditTitle] = useState(task.title);
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');
  const [editStatus, setEditStatus] = useState(
    task.completed ? 'done' : (task.status || 'todo')
  );

  const subtasks = Array.isArray(task.subtasks) ? task.subtasks : [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const totalSubtasks = subtasks.length;

  const due = formatDue(task.due_date, task.completed || task.status === 'done');

  const startEditing = () => {
    setEditTitle(task.title);
    setEditPriority(task.priority || 'medium');
    setEditStatus(task.completed ? 'done' : (task.status || 'todo'));
    setIsEditing(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!editTitle.trim()) return;
    onUpdateTask(task.id, {
      title: editTitle.trim(),
      priority: editPriority,
      status: editStatus,
      completed: editStatus === 'done'
    });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="board-task-card" style={{ gap: '0.4rem', cursor: 'default' }}>
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
            value={editStatus}
            onChange={(e) => setEditStatus(e.target.value)}
            className="selector-select"
            aria-label="Task Status"
          >
            <option value="todo">📋 To Do</option>
            <option value="in_progress">⚡ In Progress</option>
            <option value="done">✅ Done</option>
          </select>
          <select
            value={editPriority}
            onChange={(e) => setEditPriority(e.target.value)}
            className="selector-select"
            aria-label="Task Priority"
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
    <div
      className={`board-task-card ${task.completed || task.status === 'done' ? 'is-done' : ''} ${isOverlay ? 'is-overlay' : ''} ${isDragging ? 'is-dragging' : ''}`}
    >
      <div className="board-task-top">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            const nextCompleted = !task.completed;
            onUpdateTask(task.id, {
              completed: nextCompleted,
              status: nextCompleted ? 'done' : 'todo'
            });
          }}
          className={`task-check-circle ${task.completed || task.status === 'done' ? 'checked' : ''}`}
          aria-label="Toggle completed"
        >
          {(task.completed || task.status === 'done') && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', flex: 1, minWidth: 0 }}>
          <span className="board-task-title">{task.title}</span>
          {task.description && (
            <span className="board-task-desc">{task.description}</span>
          )}
        </div>
      </div>

      <div className="board-task-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          {totalSubtasks > 0 && (
            <span
              className={`subtask-mini-badge ${completedSubtasks === totalSubtasks ? 'all-done' : ''}`}
              title={`${completedSubtasks} of ${totalSubtasks} subtasks completed`}
            >
              <IconListTodo size={11} />
              <span>{completedSubtasks}/{totalSubtasks}</span>
            </span>
          )}
          {task.category && task.category !== 'General' && (
            <span className="tag-badge">{task.category}</span>
          )}
          {due && (
            <span className={due.className}>
              <IconClock size={11} />
              {due.text}
            </span>
          )}
          <span className={`prio-dot-indicator prio-dot-${task.priority || 'medium'}`} />
        </div>
        <div className="board-task-actions">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              startEditing();
            }}
            className="btn-icon-subtle btn-action-edit"
            title="Edit task"
            aria-label="Edit task"
          >
            <IconEdit size={13} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(task.id);
            }}
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

const DraggableBoardTaskCard = ({ task, onUpdateTask, onDeleteTask }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: String(task.id),
    data: { task },
    disabled: isEditing
  });

  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    opacity: isDragging ? 0.35 : 1,
    touchAction: isEditing ? 'auto' : 'none'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditing ? {} : { ...attributes, ...listeners })}
    >
      <BoardTaskCard
        task={task}
        onUpdateTask={onUpdateTask}
        onDeleteTask={onDeleteTask}
        isDragging={isDragging}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
      />
    </div>
  );
};

const BoardColumn = ({ col, onUpdateTask, onDeleteTask }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: col.id
  });

  return (
    <div
      ref={setNodeRef}
      className={`board-column ${isOver ? 'is-over' : ''}`}
      data-testid={`board-col-${col.id}`}
    >
      <div className="board-col-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className={`board-col-status-dot status-dot-${col.id}`} />
          <span>{col.title}</span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{col.count}</span>
      </div>
      <div className="board-col-tasks">
        {col.items.length === 0 ? (
          <div className="board-col-empty">
            {col.emptyText}
          </div>
        ) : (
          col.items.map(task => (
            <DraggableBoardTaskCard
              key={task.id}
              task={task}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))
        )}
      </div>
    </div>
  );
};

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, viewMode = 'list', activeNav = 'inbox' }) => {
  const [activeTask, setActiveTask] = useState(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5
    }
  });

  const sensors = useSensors(pointerSensor, touchSensor);

  // Custom collision detection: prefer pointer location, fallback to bounding rect intersection
  const customCollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    return rectIntersection(args);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find(t => String(t.id) === String(active.id));
    setActiveTask(task || null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    let targetColId = overId;
    if (!['todo', 'in_progress', 'done'].includes(targetColId)) {
      const overTask = tasks.find(t => String(t.id) === String(overId));
      if (overTask) {
        if (overTask.completed || overTask.status === 'done') {
          targetColId = 'done';
        } else if (overTask.status === 'in_progress') {
          targetColId = 'in_progress';
        } else {
          targetColId = 'todo';
        }
      }
    }

    if (!['todo', 'in_progress', 'done'].includes(targetColId)) return;

    const draggedTask = tasks.find(t => String(t.id) === String(activeId));
    if (!draggedTask) return;

    let currentColId = 'todo';
    if (draggedTask.completed || draggedTask.status === 'done') {
      currentColId = 'done';
    } else if (draggedTask.status === 'in_progress') {
      currentColId = 'in_progress';
    }

    if (currentColId === targetColId) return;

    if (targetColId === 'done') {
      onUpdateTask(draggedTask.id, { status: 'done', completed: true });
    } else if (targetColId === 'in_progress') {
      onUpdateTask(draggedTask.id, { status: 'in_progress', completed: false });
    } else if (targetColId === 'todo') {
      onUpdateTask(draggedTask.id, { status: 'todo', completed: false });
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

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
    const doneTasks = tasks.filter(t => t.completed || t.status === 'done');
    const inProgressTasks = tasks.filter(t => !doneTasks.includes(t) && t.status === 'in_progress');
    const todoTasks = tasks.filter(t => !doneTasks.includes(t) && !inProgressTasks.includes(t));

    const columns = [
      { id: 'todo', title: 'To Do', count: todoTasks.length, items: todoTasks, emptyText: 'No tasks to do' },
      { id: 'in_progress', title: 'In Progress', count: inProgressTasks.length, items: inProgressTasks, emptyText: 'No tasks in progress' },
      { id: 'done', title: 'Done', count: doneTasks.length, items: doneTasks, emptyText: 'No completed tasks' }
    ];

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="board-columns">
          {columns.map(col => (
            <BoardColumn
              key={col.id}
              col={col}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <BoardTaskCard
              task={activeTask}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              isOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>
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
