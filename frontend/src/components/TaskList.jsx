import React from 'react';
import TaskItem from './TaskItem';
import { IconInbox, IconClock, IconCheckCircle, IconTrash } from './Icons';

const TaskList = ({ tasks, onUpdateTask, onDeleteTask, viewMode = 'list' }) => {
  if (tasks.length === 0) {
    return (
      <div className="quiet-empty-state">
        <IconInbox size={26} />
        <div className="quiet-empty-title">All clear</div>
        <div className="quiet-empty-desc">No tasks in this view. Use the quick-add bar above to create one.</div>
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
                  <div key={task.id} className={`board-task-card ${task.completed ? 'is-done' : ''}`}>
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
                      <button
                        type="button"
                        onClick={() => onDeleteTask(task.id)}
                        className="btn-icon-subtle"
                        title="Delete task"
                      >
                        <IconTrash size={13} />
                      </button>
                    </div>
                  </div>
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
    </div>
  );
};

export default TaskList;