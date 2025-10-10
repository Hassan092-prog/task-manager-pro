import React, { useState } from 'react';

const TaskItem = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description
  });

  const handleToggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: task.title,
      description: task.description
    });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      {!isEditing ? (
        <>
          <div className="task-content">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <div className="task-meta">
              <span>Created: {formatDate(task.created_at)}</span>
              {task.due_date && <span>Due: {formatDate(task.due_date)}</span>}
            </div>
          </div>
          <div className="task-actions">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={handleToggleComplete}
            />
            <button onClick={handleEdit}>Edit</button>
            <button onClick={() => onDelete(task.id)} className="delete">
              Delete
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="task-content">
            <input
              type="text"
              name="title"
              value={editData.title}
              onChange={handleChange}
              className="edit-input"
            />
            <textarea
              name="description"
              value={editData.description}
              onChange={handleChange}
              className="edit-input"
            />
          </div>
          <div className="task-actions">
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;