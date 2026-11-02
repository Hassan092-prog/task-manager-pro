import React, { useState, useEffect, useRef } from 'react';
import { IconPlus, IconX, IconCalendar, IconTag, IconFlag } from './Icons';

const NewTaskModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  defaultCategory = 'Work' 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState(defaultCategory);
  const [dueDate, setDueDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const titleInputRef = useRef(null);

  // Sync default category when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setCategory(defaultCategory);
      setDueDate('');
      setError('');
      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, defaultCategory]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Preset Date Helpers
  const setDueDateToday = () => {
    const d = new Date();
    d.setHours(18, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDueDate(`${year}-${month}-${day}T18:00`);
  };

  const setDueDateTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(18, 0, 0, 0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDueDate(`${year}-${month}-${day}T18:00`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        priority,
        category,
        due_date: dueDate ? new Date(dueDate).toISOString() : null
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <IconPlus size={16} />
            </div>
            <h2 id="modal-title" className="modal-title">New Task</h2>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-icon-subtle modal-close-btn"
            aria-label="Close dialog"
            title="Close"
          >
            <IconX size={16} />
          </button>
        </div>

        {error && (
          <div className="auth-error-banner" style={{ margin: '0.75rem 1.25rem 0' }}>
            {error}
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-body">
            {/* Title */}
            <div className="modal-field">
              <label className="modal-field-label">Title</label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="modal-input"
                required
              />
            </div>

            {/* Description / Notes */}
            <div className="modal-field">
              <label className="modal-field-label">Notes (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add checklist, context, or notes..."
                className="modal-textarea"
                rows={2}
              />
            </div>

            {/* Priority Selector */}
            <div className="modal-field">
              <label className="modal-field-label">
                <IconFlag size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Priority
              </label>
              <div className="modal-chips-row">
                {[
                  { id: 'urgent', label: '🔴 Urgent' },
                  { id: 'high', label: '🟠 High' },
                  { id: 'medium', label: '🟡 Medium' },
                  { id: 'low', label: '🔵 Low' }
                ].map(p => (
                  <button
                    key={p.id}
                    type="button"
                    className={`modal-chip ${priority === p.id ? 'active' : ''}`}
                    onClick={() => setPriority(p.id)}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Project / Category Selector */}
            <div className="modal-field">
              <label className="modal-field-label">
                <IconTag size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Project
              </label>
              <div className="modal-chips-row">
                {['Work', 'Personal', 'Engineering', 'Design', 'General'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    className={`modal-chip ${category === cat ? 'active' : ''}`}
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Due Date */}
            <div className="modal-field">
              <label className="modal-field-label">
                <IconCalendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                Due Date
              </label>
              <div className="modal-date-picker-group">
                <div className="date-preset-buttons">
                  <button 
                    type="button" 
                    onClick={setDueDateToday}
                    className={`date-preset-btn ${dueDate && dueDate.includes('T18:00') ? 'active-preset' : ''}`}
                  >
                    Today
                  </button>
                  <button 
                    type="button" 
                    onClick={setDueDateTomorrow}
                    className="date-preset-btn"
                  >
                    Tomorrow
                  </button>
                  {dueDate && (
                    <button
                      type="button"
                      onClick={() => setDueDate('')}
                      className="date-preset-btn text-danger"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="modal-date-input"
                  title="Pick exact date and time"
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="modal-btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="modal-btn-submit"
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTaskModal;
