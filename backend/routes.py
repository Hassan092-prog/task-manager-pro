from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task, User
from datetime import datetime

tasks = Blueprint('tasks', __name__)

@tasks.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    try:
        current_user_id = int(get_jwt_identity())
        query = Task.query.filter_by(user_id=current_user_id)
        
        # Filters
        status = request.args.get('status')
        if status:
            query = query.filter_by(status=status.lower())
            
        priority = request.args.get('priority')
        if priority:
            query = query.filter_by(priority=priority)
            
        category = request.args.get('category')
        if category:
            query = query.filter_by(category=category)
            
        completed = request.args.get('completed')
        if completed is not None:
            if completed.lower() == 'true':
                query = query.filter_by(completed=True)
            elif completed.lower() == 'false':
                query = query.filter_by(completed=False)
                
        search = request.args.get('search')
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(Task.title.ilike(search_pattern) | Task.description.ilike(search_pattern))
            
        sort_by = request.args.get('sort_by', 'created_at')
        if sort_by == 'due_date':
            query = query.order_by(Task.due_date.asc().nullslast())
        else:
            query = query.order_by(Task.created_at.desc())
            
        user_tasks = query.all()
        return jsonify([task.to_dict() for task in user_tasks]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@tasks.route('/tasks', methods=['POST'])
@jwt_required()
def create_task():
    try:
        current_user_id = int(get_jwt_identity())
        data = request.get_json()
        
        title = data.get('title', '').strip()
        if not title:
            return jsonify({'error': 'Task title is required'}), 400
        
        # Parse due_date if provided
        due_date = None
        if data.get('due_date'):
            due_date = datetime.fromisoformat(data.get('due_date').replace('Z', '+00:00'))
        
        priority = data.get('priority', 'medium').lower()
        if priority not in ['low', 'medium', 'high', 'urgent']:
            priority = 'medium'
            
        category = data.get('category', 'General').strip() or 'General'
        
        status = data.get('status', 'todo').lower() if data.get('status') else 'todo'
        if status not in ['todo', 'in_progress', 'done']:
            status = 'todo'
            
        completed = bool(data.get('completed', False))
        if status == 'done':
            completed = True
        elif completed:
            status = 'done'
        
        task = Task(
            title=title,
            description=data.get('description', ''),
            completed=completed,
            status=status,
            priority=priority,
            category=category,
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
        current_user_id = int(get_jwt_identity())
        task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        data = request.get_json()
        
        if 'title' in data:
            new_title = data['title'].strip()
            if new_title:
                task.title = new_title
        if 'description' in data:
            task.description = data['description']
            
        # Dual-sync status & completed
        if 'status' in data:
            new_status = (data['status'] or '').lower().strip()
            if new_status in ['todo', 'in_progress', 'done']:
                task.status = new_status
                task.completed = (new_status == 'done')
                
        if 'completed' in data:
            is_comp = bool(data['completed'])
            task.completed = is_comp
            if 'status' not in data:
                if is_comp:
                    task.status = 'done'
                elif task.status == 'done':
                    task.status = 'todo'

        if 'priority' in data:
            new_prio = data['priority'].lower()
            if new_prio in ['low', 'medium', 'high', 'urgent']:
                task.priority = new_prio
        if 'category' in data:
            new_cat = data['category'].strip()
            if new_cat:
                task.category = new_cat
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
        current_user_id = int(get_jwt_identity())
        task = Task.query.filter_by(id=task_id, user_id=current_user_id).first()
        
        if not task:
            return jsonify({'error': 'Task not found'}), 404
        
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({'message': 'Task deleted successfully'}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500
