# REST API Specification — Task Manager Pro

**Version:** 2.0.0  
**Protocol:** REST / JSON  
**Base URLs:**
- Local Docker / Dev: `http://localhost:5001/api`
- Production (Render): `https://task-manager-backend-767m.onrender.com/api`

---

## 1. System Health & Developer Status

### 1.1 Developer Dashboard / Health Check
- **Method:** `GET`
- **Path:** `/` (Backend root)
- **Auth Required:** No
- **Response Format:**
  - Web Browser (`Accept: text/html`): Modern responsive Swiss/Linear developer status dashboard.
  - API Client (`Accept: application/json` or `?format=json`): Operational status JSON.

#### Response `200 OK` (JSON)
```json
{
  "service": "Task Manager Pro API",
  "status": "operational",
  "version": "2.0.0",
  "documentation": "https://github.com/786Hassan92/task-manager-pro",
  "endpoints": {
    "auth_register": "POST /api/auth/register",
    "auth_login": "POST /api/auth/login",
    "auth_refresh": "POST /api/auth/refresh",
    "auth_protected": "GET /api/auth/protected",
    "tasks_list": "GET /api/tasks",
    "tasks_create": "POST /api/tasks",
    "tasks_update": "PUT /api/tasks/<id>",
    "tasks_delete": "DELETE /api/tasks/<id>",
    "subtasks_create": "POST /api/tasks/<id>/subtasks",
    "subtasks_update": "PUT /api/tasks/<id>/subtasks/<subtask_id>",
    "subtasks_delete": "DELETE /api/tasks/<id>/subtasks/<subtask_id>"
  }
}
```

---

## 2. Authentication Endpoints

### 2.1 Register User
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Auth Required:** No

#### Request Body
```json
{
  "username": "hassan_pro",
  "email": "hassan@example.com",
  "password": "strongPassword123"
}
```

#### Response `201 Created`
```json
{
  "message": "User created successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "hassan_pro",
    "email": "hassan@example.com",
    "created_at": "2026-11-05T08:00:00Z"
  }
}
```

---

### 2.2 Login User
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Auth Required:** No

#### Request Body
```json
{
  "email": "hassan@example.com",
  "password": "strongPassword123"
}
```

#### Response `200 OK`
```json
{
  "message": "Login successful",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "hassan_pro",
    "email": "hassan@example.com",
    "created_at": "2026-11-05T08:00:00Z"
  }
}
```

---

### 2.3 Silent Token Refresh
- **Method:** `POST`
- **Path:** `/api/auth/refresh`
- **Auth Required:** Yes (`Authorization: Bearer <refresh_token>`)

#### Response `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2.4 Validate Protected Session
- **Method:** `GET`
- **Path:** `/api/auth/protected`
- **Auth Required:** Yes (`Authorization: Bearer <access_token>`)

#### Response `200 OK`
```json
{
  "logged_in_as": 1,
  "user": {
    "id": 1,
    "username": "hassan_pro",
    "email": "hassan@example.com",
    "created_at": "2026-11-05T08:00:00Z"
  }
}
```

---

## 3. Tasks Endpoints

All task endpoints require `Authorization: Bearer <access_token>`. Queries are strictly scoped to the authenticated user ID.

### 3.1 Get All Tasks (With Filtering & Search)
- **Method:** `GET`
- **Path:** `/api/tasks`
- **Auth Required:** Yes
- **Query Parameters (All optional):**
  - `status` (string): Filter by workflow status (`todo`, `in_progress`, `done`).
  - `priority` (string): Filter by priority (`urgent`, `high`, `medium`, `low`).
  - `category` (string): Filter by category tag (e.g. `Engineering`, `Design`, `Work`, `Personal`).
  - `completed` (boolean): `true` or `false`.
  - `search` (string): Case-insensitive text query matching title or description.
  - `sort_by` (string): Sort order (`created_at`, `due_date`, `priority`).

#### Response `200 OK`
```json
[
  {
    "id": 42,
    "title": "Design multi-screen responsive layout",
    "description": "Ensure optimal ergonomics for small mobile screens and large desktop screens.",
    "completed": true,
    "status": "done",
    "priority": "urgent",
    "category": "Design",
    "subtasks": [
      {
        "id": "st-a1",
        "title": "Create Figma prototypes",
        "completed": true
      },
      {
        "id": "st-a2",
        "title": "Build pure SVG sparklines",
        "completed": true
      }
    ],
    "created_at": "2026-11-01T10:15:00Z",
    "updated_at": "2026-11-05T08:30:00Z",
    "completed_at": "2026-11-05T08:30:00Z",
    "due_date": "2026-11-05T18:00:00Z",
    "user_id": 1
  }
]
```

---

### 3.2 Create Task
- **Method:** `POST`
- **Path:** `/api/tasks`
- **Auth Required:** Yes

#### Request Body
```json
{
  "title": "Build Mobile Floating Action Button",
  "description": "Add FAB to bottom-right on mobile viewports for one-handed operation.",
  "priority": "high",
  "category": "Engineering",
  "status": "todo",
  "completed": false,
  "due_date": "2026-11-06T12:00:00Z",
  "subtasks": [
    { "title": "Implement safe-area positioning" },
    { "title": "Add elevation shadow" }
  ]
}
```

#### Response `201 Created`
```json
{
  "message": "Task created successfully",
  "task": {
    "id": 43,
    "title": "Build Mobile Floating Action Button",
    "description": "Add FAB to bottom-right on mobile viewports for one-handed operation.",
    "completed": false,
    "status": "todo",
    "priority": "high",
    "category": "Engineering",
    "subtasks": [
      { "id": "b3e9f1a2", "title": "Implement safe-area positioning", "completed": false },
      { "id": "c4f0a2b3", "title": "Add elevation shadow", "completed": false }
    ],
    "created_at": "2026-11-05T08:45:00Z",
    "updated_at": "2026-11-05T08:45:00Z",
    "completed_at": null,
    "due_date": "2026-11-06T12:00:00Z",
    "user_id": 1
  }
}
```

---

### 3.3 Update Task (Partial Mutation & Status Reconciliation)
- **Method:** `PUT`
- **Path:** `/api/tasks/<id>`
- **Auth Required:** Yes

> **Dual-Sync Reconciliation Note:** Setting `status: 'done'` automatically updates `completed: true` and records `completed_at`. Unchecking `completed: false` sets `status: 'todo'` and clears `completed_at: null`.

#### Request Body
```json
{
  "completed": true,
  "status": "done",
  "priority": "urgent"
}
```

#### Response `200 OK`
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": 43,
    "title": "Build Mobile Floating Action Button",
    "description": "Add FAB to bottom-right on mobile viewports for one-handed operation.",
    "completed": true,
    "status": "done",
    "priority": "urgent",
    "category": "Engineering",
    "subtasks": [
      { "id": "b3e9f1a2", "title": "Implement safe-area positioning", "completed": false },
      { "id": "c4f0a2b3", "title": "Add elevation shadow", "completed": false }
    ],
    "created_at": "2026-11-05T08:45:00Z",
    "updated_at": "2026-11-05T08:50:00Z",
    "completed_at": "2026-11-05T08:50:00Z",
    "due_date": "2026-11-06T12:00:00Z",
    "user_id": 1
  }
}
```

---

### 3.4 Delete Task
- **Method:** `DELETE`
- **Path:** `/api/tasks/<id>`
- **Auth Required:** Yes

#### Response `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

---

## 4. Subtasks Endpoints

### 4.1 Add Subtask to Task
- **Method:** `POST`
- **Path:** `/api/tasks/<id>/subtasks`
- **Auth Required:** Yes

#### Request Body
```json
{
  "title": "Verify touch event cancellation"
}
```

#### Response `201 Created`
```json
{
  "message": "Subtask added successfully",
  "task": { ... }
}
```

---

### 4.2 Update Subtask (Toggle Completion or Title)
- **Method:** `PUT`
- **Path:** `/api/tasks/<id>/subtasks/<subtask_id>`
- **Auth Required:** Yes

#### Request Body
```json
{
  "completed": true
}
```

#### Response `200 OK`
```json
{
  "message": "Subtask updated successfully",
  "task": { ... }
}
```

---

### 4.3 Delete Subtask
- **Method:** `DELETE`
- **Path:** `/api/tasks/<id>/subtasks/<subtask_id>`
- **Auth Required:** Yes

#### Response `200 OK`
```json
{
  "message": "Subtask deleted successfully",
  "task": { ... }
}
```
