from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task, User
from datetime import datetime

tasks = Blueprint('tasks', __name__)

@tasks.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        current_user_id = int(get_jwt_identity())  # Convert back to int for database
        user_tasks = Task.query.filter_by(user_id=current_user_id).all()
        return jsonify([task.to_dict() for task in user_tasks]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    try:
        current_user_id = int(get_jwt_identity())  # Convert back to int for database
        data = request.get_json()
        
        # Parse due_date if provided
        due_date = None
        if data.get('due_date'):
            due_date = datetime.fromisoformat(data.get('due_date').replace('Z', '+00:00'))
        
        task = Task(
            title=data.get('title'),
            description=data.get('description', ''),
            due_date=due_date,
            user_id=current_user_id
        )
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({'message': 'Task created successfully', 'task': task.to_dict()}), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    try:
        current_user_id = int(get_jwt_identity())  # Convert back to int for database
        task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        data = request.get_json()
        
        if 'title' in data:
            task.title = data['title']
        if 'description' in data:
            task.description = data['description']
        if 'completed' in data:
            task.completed = data['completed']
        if 'due_date' in data:
            task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00')) if data['due_date'] else None
        
        db.session.commit()
        
        return jsonify({'message': 'Task updated successfully', 'task': task.to_dict()}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    try:
        current_user_id = int(get_jwt_identity())  # Convert back to int for database
        task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500