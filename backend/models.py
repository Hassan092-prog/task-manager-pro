from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime, timezone
import json

db = SQLAlchemy()
bcrypt = Bcrypt()

def utc_now():
    return datetime.now(timezone.utc)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=utc_now)
    tasks = db.relationship('Task', backref='author', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(20), default='todo', nullable=True)
    priority = db.Column(db.String(20), default='medium', nullable=True)
    category = db.Column(db.String(50), default='General', nullable=True)
    subtasks = db.Column(db.JSON, default=list, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    due_date = db.Column(db.DateTime, nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        raw_subtasks = getattr(self, 'subtasks', [])
        if isinstance(raw_subtasks, str):
            try:
                subtasks_val = json.loads(raw_subtasks)
            except Exception:
                subtasks_val = []
        elif isinstance(raw_subtasks, list):
            subtasks_val = raw_subtasks
        else:
            subtasks_val = []

        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'status': getattr(self, 'status', 'todo') or 'todo',
            'priority': getattr(self, 'priority', 'medium') or 'medium',
            'category': getattr(self, 'category', 'General') or 'General',
            'subtasks': subtasks_val,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if getattr(self, 'updated_at', None) else None,
            'completed_at': self.completed_at.isoformat() if getattr(self, 'completed_at', None) else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'user_id': self.user_id
        }
