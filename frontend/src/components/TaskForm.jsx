import React, { useState } from 'react';

const TaskForm = ({ onSubmit, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'Work',
    due_date: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePrioritySelect = (priority) => {
    setFormData({ ...formData, priority });
  };

  const handleQuickPreset = (type) => {
    const now = new Date();
    if (type === 'today') {
      now.setHours(18, 0, 0, 0);
    } else if (type === 'tomorrow') {
      now.setDate(now.getDate() + 1);
      now.setHours(12, 0, 0, 0);
    } else if (type === 'next_week') {
      now.setDate(now.getDate() + 7);
      now.setHours(10, 0, 0, 0);
    }
    const isoString = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFormData({ ...formData, due_date: isoString });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit({
      ...formData,
      due_date: formData.due_date ? new Date(formData.due_date).toISOString() : null
    });
  };

  return (
    <div className="modal-dialog">
      <div className="modal-header">
        <h3>Create New Task</h3>
        {onCancel && (
          <button type="button" onClick={onCancel} className="modal-close-btn" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="form-field-group">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Design multi-screen responsive layout"
              value={formData.title}
              onChange={handleChange}
              className="form-input-text"
              required
              autoFocus
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              name="description"
              placeholder="Add key context, links, or sub-requirements..."
              value={formData.description}
              onChange={handleChange}
              className="form-input-textarea"
              rows="3"
            />
          </div>

          <div className="form-field-group">
            <label className="form-label">Priority Level</label>
            <div className="priority-selector">
              {[
                { id: 'urgent', label: '🔴 Urgent' },
                { id: 'high', label: '🟠 High' },
                { id: 'medium', label: '🔵 Medium' },
                { id: 'low', label: '⚪ Low' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  className={`prio-opt-btn ${p.id} ${formData.priority === p.id ? 'active' : ''}`}
                  onClick={() => handlePrioritySelect(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-field-group">
              <label className="form-label">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="form-input-select"
              >
                <option value="Work">💼 Work</option>
                <option value="Personal">🏠 Personal</option>
                <option value="Engineering">💻 Engineering</option>
                <option value="Design">🎨 Design</option>
                <option value="Urgent">⚡ Urgent</option>
                <option value="General">📋 General</option>
              </select>
            </div>

            <div className="form-field-group">
              <label className="form-label">Due Date</label>
              <input
                type="datetime-local"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="form-input-text"
              />
            </div>
          </div>

          {/* Quick preset chips for due date */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '-0.25rem' }}>
            <button 
              type="button" 
              onClick={() => handleQuickPreset('today')} 
              className="chip-btn"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              Today EOD
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickPreset('tomorrow')} 
              className="chip-btn"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              Tomorrow
            </button>
            <button 
              type="button" 
              onClick={() => handleQuickPreset('next_week')} 
              className="chip-btn"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
            >
              Next Week
            </button>
          </div>
        </div>

        <div className="modal-footer">
          {onCancel && (
            <button type="button" onClick={onCancel} className="btn-sm-cancel">
              Cancel
            </button>
          )}
          <button type="submit" disabled={loading} className="btn-primary-add">
            {loading ? 'Creating...' : '+ Create Task'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;