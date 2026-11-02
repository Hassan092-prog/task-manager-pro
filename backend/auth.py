from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models import db, User
from datetime import datetime

auth = Blueprint('auth', __name__)
bcrypt = Bcrypt()

@auth.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email already registered'}), 400
        if User.query.filter_by(username=data.get('username')).first():
            return jsonify({'error': 'Username already taken'}), 400

        # Create new user
        hashed_password = bcrypt.generate_password_hash(data.get('password')).decode('utf-8')
        user = User(
            username=data.get('username'),
            email=data.get('email'),
            password=hashed_password
        )
        
        db.session.add(user)
        db.session.commit()

        # FIX: Convert user.id to string for JWT
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': user.to_dict()
        }), 201

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data.get('email')).first()

        if user and bcrypt.check_password_hash(user.password, data.get('password')):
            # FIX: Convert user.id to string for JWT
            access_token = create_access_token(identity=str(user.id))
            return jsonify({
                'message': 'Login successful',
                'access_token': access_token,
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    try:
        current_user_id = get_jwt_identity()
        # Convert back to integer for database query
        user = db.session.get(User, int(current_user_id))
        if user:
            return jsonify({'message': f'Hello {user.username}!', 'user': user.to_dict()})
        else:
            return jsonify({'error': 'User not found'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500