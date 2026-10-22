# REST API Specification — Task Manager Pro

Base URL:
- Local Development: `http://localhost:5001/api`
- Production: `https://task-manager-backend-767m.onrender.com/api`

---

## 1. System Health & Developer Status

### 1.1 Developer Dashboard / Health Check
- **Method:** `GET`
- **Path:** `/` (Backend root)
- **Auth Required:** No
- **Response Format:**
  - Returns modern HTML status page when requested via a web browser (`Accept: text/html`).
  - Returns JSON payload when requested via API client (`Accept: application/json` or `?format=json`).

#### Response `200 OK` (JSON)
```json
{
  "service": "Task Manager Pro API",
  "status": "operational",
  "version": "1.2.0",
  "documentation": "https://github.com/786Hassan92/task-manager-pro",
  "endpoints": {
    "auth_register": "POST /api/auth/register",
    "auth_login": "POST /api/auth/login",
    "auth_protected": "GET /api/auth/protected",
    "tasks_list": "GET /api/tasks",
    "tasks_create": "POST /api/tasks",
    "tasks_update": "PUT /api/tasks/<id>",
    "tasks_delete": "DELETE /api/tasks/<id>"
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
  "user": {
    "id": 1,
    "username": "hassan_pro",
    "email": "hassan@example.com",
    "created_at": "2026-10-22T10:00:00"
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
  "user": {
    "id": 1,
    "username": "hassan_pro",
    "email": "hassan@example.com",
    "created_at": "2026-10-22T10:00:00"
  }
}
```

---

### 2.3 Validate Protected Session
- **Method:** `GET`
- **Path:** `/api/auth/protected`
- **Auth Required:** Yes (`Authorization: Bearer <token>`)

---

## 3. Tasks Endpoints

All task endpoints require the `Authorization: Bearer <access_token>` header.

### 3.1 Get All Tasks (With Filtering & Search)
- **Method:** `GET`
- **Path:** `/api/tasks`
- **Auth Required:** Yes
- **Query Parameters (All optional):**
  - `search` (string): Search text in title or description.
  - `priority` (string): Filter by `urgent`, `high`, `medium`, or `low`.
  - `category` (string): Filter by category name (e.g. `Work`, `Personal`).
  - `completed` (boolean): `true` or `false`.
  - `sort_by` (string): `created_at` or `due_date`.

#### Response `200 OK`
```json
[
  {
    "id": 1,
    "title": "Design multi-screen responsive layout",
    "description": "Ensure optimal ergonomics for small mobile screens and large desktop screens.",
    "completed": false,
    "priority": "urgent",
    "category": "Design",
    "created_at": "2026-10-22T10:15:00",
    "due_date": "2026-10-25T18:00:00",
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
  "due_date": "2026-10-24T12:00:00Z"
}
```

#### Response `201 Created`
```json
{
  "message": "Task created successfully",
  "task": {
    "id": 2,
    "title": "Build Mobile Floating Action Button",
    "description": "Add FAB to bottom-right on mobile viewports for one-handed operation.",
    "completed": false,
    "priority": "high",
    "category": "Engineering",
    "created_at": "2026-10-22T10:20:00",
    "due_date": "2026-10-24T12:00:00",
    "user_id": 1
  }
}
```

---

### 3.3 Update Task (Partial Mutation)
- **Method:** `PUT`
- **Path:** `/api/tasks/<id>`
- **Auth Required:** Yes

#### Request Body
```json
{
  "completed": true,
  "priority": "medium",
  "category": "Engineering"
}
```

#### Response `200 OK`
```json
{
  "message": "Task updated successfully",
  "task": {
    "id": 2,
    "title": "Build Mobile Floating Action Button",
    "description": "Add FAB to bottom-right on mobile viewports for one-handed operation.",
    "completed": true,
    "priority": "medium",
    "category": "Engineering",
    "created_at": "2026-10-22T10:20:00",
    "due_date": "2026-10-24T12:00:00",
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
