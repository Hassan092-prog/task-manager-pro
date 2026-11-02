from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from config import Config
from auth import auth
from routes import tasks
from sqlalchemy import text
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
    
    # Create tables & perform lightweight schema migration for SQLite if needed
    with app.app_context():
        db.create_all()
        try:
            with db.engine.connect() as conn:
                res = conn.execute(text("PRAGMA table_info(task);")).fetchall()
                existing_cols = {row[1] for row in res}
                if existing_cols:
                    if 'priority' not in existing_cols:
                        conn.execute(text("ALTER TABLE task ADD COLUMN priority VARCHAR(20) DEFAULT 'medium';"))
                    if 'category' not in existing_cols:
                        conn.execute(text("ALTER TABLE task ADD COLUMN category VARCHAR(50) DEFAULT 'General';"))
                    if 'status' not in existing_cols:
                        conn.execute(text("ALTER TABLE task ADD COLUMN status VARCHAR(20) DEFAULT 'todo';"))
                    if 'subtasks' not in existing_cols:
                        conn.execute(text("ALTER TABLE task ADD COLUMN subtasks TEXT DEFAULT '[]';"))
                    if 'updated_at' not in existing_cols:
                        conn.execute(text("ALTER TABLE task ADD COLUMN updated_at DATETIME;"))
                    conn.execute(text("UPDATE task SET status = 'done' WHERE completed = 1 AND (status IS NULL OR status = 'todo');"))
                    conn.execute(text("UPDATE task SET status = 'todo' WHERE status IS NULL;"))
                    conn.execute(text("UPDATE task SET subtasks = '[]' WHERE subtasks IS NULL;"))
                    conn.execute(text("UPDATE task SET updated_at = created_at WHERE updated_at IS NULL;"))
                    conn.commit()
        except Exception:
            pass  # Non-SQLite or already migrated
    
    @app.route('/')
    def home():
        accept_header = request.headers.get('Accept', '')
        if 'text/html' in accept_header and request.args.get('format') != 'json':
            return '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Manager Pro — API Engine</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #090d16;
            --surface: #101726;
            --border: rgba(255, 255, 255, 0.08);
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --accent: #6366f1;
            --emerald: #10b981;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text-primary);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            line-height: 1.6;
        }
        .container {
            max-width: 680px;
            width: 100%;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            position: relative;
            overflow: hidden;
        }
        .container::before {
            content: '';
            position: absolute;
            top: 0; left: 0; right: 0; height: 3px;
            background: linear-gradient(90deg, #6366f1, #10b981, #06b6d4);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        .brand {
            font-size: 1.4rem;
            font-weight: 700;
            letter-spacing: -0.02em;
            display: flex;
            align-items: center;
            gap: 0.6rem;
        }
        .badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.25);
            color: #34d399;
            padding: 0.35rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.8rem;
            font-weight: 600;
        }
        .pulse {
            width: 8px; height: 8px;
            background: #10b981;
            border-radius: 50%;
            box-shadow: 0 0 10px #10b981;
        }
        p.desc {
            color: var(--text-secondary);
            font-size: 0.95rem;
            margin-bottom: 2rem;
        }
        .endpoints-title {
            font-size: 0.8rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--text-secondary);
            font-weight: 700;
            margin-bottom: 1rem;
        }
        .endpoint-grid {
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            margin-bottom: 2rem;
        }
        .endpoint-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid var(--border);
            padding: 0.65rem 1rem;
            border-radius: 8px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
        }
        .method {
            font-weight: 700;
            padding: 0.2rem 0.5rem;
            border-radius: 4px;
            font-size: 0.75rem;
        }
        .method.get { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
        .method.post { background: rgba(16, 185, 129, 0.15); color: #34d399; }
        .method.put { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }
        .method.del { background: rgba(244, 63, 94, 0.15); color: #fb7185; }
        .footer {
            border-top: 1px solid var(--border);
            padding-top: 1.25rem;
            display: flex;
            justify-content: space-between;
            color: var(--text-secondary);
            font-size: 0.8rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }
        .footer a {
            color: var(--accent);
            text-decoration: none;
            font-weight: 600;
        }
        .footer a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="brand">
                <span>⚡</span> Task Manager Pro <span style="font-weight:400; color:var(--text-secondary); font-size:1rem;">API</span>
            </div>
            <div class="badge">
                <span class="pulse"></span> Operational v1.4.0
            </div>
        </div>
        <p class="desc">High-performance REST API service powering Task Manager Pro. Authenticated with JWT, hardened with Bcrypt security, and ready for high-throughput client requests.</p>
        
        <div class="endpoints-title">Active API Endpoints</div>
        <div class="endpoint-grid">
            <div class="endpoint-row">
                <span><span class="method post">POST</span> /api/auth/register</span>
                <span style="color:var(--text-secondary); font-size:0.75rem;">Account Setup</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method post">POST</span> /api/auth/login</span>
                <span style="color:var(--text-secondary); font-size:0.75rem;">JWT Issuance</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method get">GET</span> /api/auth/protected</span>
                <span style="color:var(--text-secondary); font-size:0.75rem;">Session Verify</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method get">GET</span> /api/tasks</span>
                <span style="color:var(--text-secondary); font-size:0.75rem;">Filter & Sort</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method post">POST</span> /api/tasks</span>
                <span style="color:var(--text-secondary); font-size:0.75rem;">Create Task</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method put">PUT</span> <span class="method del">DEL</span> /api/tasks/&lt;id&gt;</span>
                <span style="color:var(--text-secondary); font-size:0.75rem;">Mutation & Delete</span>
            </div>
            <div class="endpoint-row">
                <span><span class="method post">POST</span> <span class="method put">PUT</span> <span class="method del">DEL</span> /api/tasks/&lt;id&gt;/subtasks</span>
                <span style="color:var(--text-secondary); font-size:0.75rem;">Subtasks Checklist</span>
            </div>
        </div>

        <div class="footer">
            <span>Client SPA: <a href="https://task-manager-frontend-lake-seven.vercel.app" target="_blank" rel="noopener">Launch Web App →</a></span>
            <span>Format: <a href="/?format=json">View JSON Status</a></span>
        </div>
    </div>
</body>
</html>''', 200

        return jsonify({
            'service': 'Task Manager Pro API',
            'status': 'operational',
            'version': '1.4.0',
            'documentation': 'https://github.com/786Hassan92/task-manager-pro',
            'endpoints': {
                'auth_register': 'POST /api/auth/register',
                'auth_login': 'POST /api/auth/login',
                'auth_protected': 'GET /api/auth/protected',
                'tasks_list': 'GET /api/tasks',
                'tasks_create': 'POST /api/tasks',
                'tasks_update': 'PUT /api/tasks/<id>',
                'tasks_delete': 'DELETE /api/tasks/<id>',
                'subtasks_create': 'POST /api/tasks/<id>/subtasks',
                'subtasks_update': 'PUT /api/tasks/<id>/subtasks/<subtask_id>',
                'subtasks_delete': 'DELETE /api/tasks/<id>/subtasks/<subtask_id>'
            }
        }), 200

    return app
if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
