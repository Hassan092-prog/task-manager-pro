import sys
import os
import pytest

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from models import db

@pytest.fixture
def app():
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'
    os.environ['SECRET_KEY'] = 'test-secret-key-12345-super-secure-32bytes-min'
    os.environ['JWT_SECRET_KEY'] = 'test-jwt-secret-key-67890-secure-32bytes-min'
    
    flask_app = create_app()
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'JWT_SECRET_KEY': 'test-jwt-secret-key-67890-secure-32bytes-min',
        'SECRET_KEY': 'test-secret-key-12345-super-secure-32bytes-min'
    })

    with flask_app.app_context():
        db.create_all()
        yield flask_app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def register_and_login(client):
    def _auth(username="testuser", email="test@example.com", password="password123"):
        # Register
        client.post('/api/auth/register', json={
            'username': username,
            'email': email,
            'password': password
        })
        # Login
        login_res = client.post('/api/auth/login', json={
            'email': email,
            'password': password
        })
        token = login_res.get_json()['access_token']
        return {'Authorization': f'Bearer {token}'}
    return _auth
