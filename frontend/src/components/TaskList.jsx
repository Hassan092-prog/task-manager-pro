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
  rectIntersection
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TaskItem from './TaskItem';
import { IconInbox, IconClock, IconCheckCircle, IconTrash, IconEdit } from './Icons';

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
    <div className={`board-column ${isOver ? 'is-over' : ''}`}>
      <div className="board-col-head">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span className={`board-col-status-dot status-dot-${col.id}`} />
          <span>{col.title}</span>
        </div>
        <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>{col.count}</span>
      </div>
      <div ref={setNodeRef} className="board-col-tasks" data-testid={`board-col-${col.id}`}>
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
    const todoTasks = tasks.filter(t => !t.completed && (t.status === 'todo' || !t.status));
    const inProgressTasks = tasks.filter(t => !t.completed && t.status === 'in_progress');
    const doneTasks = tasks.filter(t => t.completed || t.status === 'done');

    const columns = [
      { id: 'todo', title: 'To Do', count: todoTasks.length, items: todoTasks, emptyText: 'No tasks to do' },
      { id: 'in_progress', title: 'In Progress', count: inProgressTasks.length, items: inProgressTasks, emptyText: 'No tasks in progress' },
      { id: 'done', title: 'Done', count: doneTasks.length, items: doneTasks, emptyText: 'No completed tasks' }
    ];

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
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
