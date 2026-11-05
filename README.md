# Task Manager Pro ⚡

> A modern, lightweight, and versatile full-stack task management application engineered for high performance, mobile ergonomics, and keyboard-driven productivity across desktop, tablet, and mobile devices.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)](https://task-manager-frontend-lake-seven.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://task-manager-backend-767m.onrender.com)
[![React](https://img.shields.io/badge/React-19.1-blue?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7.1-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![Flask](https://img.shields.io/badge/Flask-2.3-lightgrey?style=flat&logo=flask)](https://flask.palletsprojects.com/)
[![Tests](https://img.shields.io/badge/Tests-82%20Vitest%20%7C%2034%20Pytest-brightgreen)](./docs/STATUS.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🌐 Live Deployments & Local Ports

- **Frontend Application:** [https://task-manager-frontend-lake-seven.vercel.app](https://task-manager-frontend-lake-seven.vercel.app) (or `http://localhost:5173`)
- **Backend API Service:** [https://task-manager-backend-767m.onrender.com/](https://task-manager-backend-767m.onrender.com/) (or `http://localhost:5001`)

---

## 📚 Project Documentation

Detailed technical architecture and documentation are maintained in the [`docs/`](./docs) directory:

- 🏗️ **[System Architecture](./docs/ARCHITECTURE.md):** Complete component hierarchy, data models, ER diagram, and container topology.
- 📊 **[Codebase Status & Audit Report](./docs/STATUS.md):** Verified features, test metrics, and upgrade matrix.
- 🗺️ **[Product Roadmap](./docs/ROADMAP.md):** Phased sprint plan and multi-device ergonomics.
- 🔌 **[REST API Specification](./docs/API.md):** Authentication, task CRUD, subtask endpoints, payloads, and response structures.

---

## 🚀 Key Features

- **⚡ Global Command Palette (`Cmd+K` / `Ctrl+K`):** Spotlight-style command center for instantaneous task search, fast navigation, quick actions, and theme toggling with cyclic keyboard navigation.
- **📋 Dual View Engine:** Switch seamlessly between a clean **Swiss List View** and a 3-column **Drag-and-Drop Kanban Board** (`To Do`, `In Progress`, `Done`) powered by `@dnd-kit/core`.
- **📱 Mobile-Native Ergonomics:**
  - Fixed bottom navigation bar with Apple safe-area inset support (`env(safe-area-inset-bottom)`).
  - Axis-locked touch swipe gestures: swipe right to toggle completion, swipe left to delete.
  - Touch drag-to-dismiss bottom sheet modal for task creation.
  - Floating Action Button (FAB) positioned for single-handed thumb operation.
- **📊 Productivity Analytics & Velocity Curves (`/app/stats`):**
  - Pure SVG 14-day completion velocity area chart with interactive tooltip nodes (zero external charting libraries).
  - Daily consistency streak counter (active & all-time best records).
  - Category distribution progress bars and urgency tier matrix.
- **✅ Nested Subtasks & Checklists:** Break complex tasks into subtasks with visual completion badges, inline checklist toggles on Kanban cards, and modal checklist builders.
- **🌅 Daily Rhythm Companion:** Daily rhythm ring, 7-day interactive week strip, scratchpad, and workload distribution.
- **🔐 Secure Authentication:** Bcrypt password hashing, JWT token rotation (`/api/auth/refresh`), and Axios automatic 401 retry queues.
- **📶 PWA & Offline Resilience:** Progressive Web App with Workbox runtime caching, offline status badge, and network state indicators.
- **🪶 Zero UI Bloat:** Pure Vanilla CSS design tokens (Obsidian / Zinc) and pure SVG icons. No Tailwind, Bootstrap, or component library bloat.

---

## 🛠️ Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, React Router DOM 7, `@dnd-kit/core`, Axios, `vite-plugin-pwa`, Vanilla CSS |
| **Backend** | Python 3.11+, Flask 2.3, Flask-SQLAlchemy, Flask-Bcrypt, Flask-JWT-Extended, Flask-CORS, Gunicorn |
| **Database** | SQLite (Local Development & Persistent Docker Volume) / PostgreSQL |
| **Containerization** | Docker, Docker Compose, Multi-stage Dockerfiles, Nginx Alpine Reverse Proxy |
| **Testing & CI** | Vitest (82 unit tests), Pytest (34 unit tests with 92% coverage), ESLint, GitHub Actions |

---

## 🐳 Docker Setup (Recommended)

Run the entire full-stack application (Frontend + Backend + SQLite database) with a single command:

```bash
# Start Frontend (:5173), Backend (:5001) & SQLite persistence
docker compose up -d --build

# View container logs
docker compose logs -f

# Check container health status
docker compose ps

# Stop all services
docker compose down
```

- **Frontend Application:** Open [http://localhost:5173](http://localhost:5173) (or `http://<server-ip>:5173`)
- **Backend API & Status Dashboard:** Open [http://localhost:5001](http://localhost:5001)

#### Optional PostgreSQL Database Mode
If you prefer PostgreSQL over SQLite:
```bash
docker compose --profile postgres up -d --build
```

---

## 🧪 Automated Test Execution

### Frontend Tests (Vitest & ESLint)
```bash
cd frontend
npm test -- --run    # Executes all 82 Vitest tests
npm run lint         # Runs ESLint (0 warnings, 0 errors)
```

### Backend Tests (Pytest)
```bash
cd backend
source venv/bin/activate
pytest tests/ -v     # Executes all 34 Pytest tests
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
