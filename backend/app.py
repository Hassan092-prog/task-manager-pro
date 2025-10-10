from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from config import Config
from auth import auth
from routes import tasks
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    db.init_app(app)
    jwt = JWTManager(app)
    CORS(app)  # Enable CORS for all routes
    
    # Register blueprints
    app.register_blueprint(auth, url_prefix='/api/auth')
    app.register_blueprint(tasks, url_prefix='/api')
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app
    @app.route('/')
    def home():
        return '''
        <h1>Task Manager API</h1>
        <p>Backend is running successfully!</p>
        <p>Available endpoints:</p>
        <ul>
            <li>POST /api/auth/register - Register user</li>
            <li>POST /api/auth/login - Login user</li>
            <li>GET /api/auth/protected - Protected route</li>
            <li>GET /api/tasks - Get tasks</li>
            <li>POST /api/tasks - Create task</li>
        </ul>
        <p>Use Thunder Client or Postman to test the API endpoints.</p>
        '''
if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)