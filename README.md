# Task Manager Pro ⚡

> A modern, lightweight, and versatile full-stack task management application engineered for high-performance productivity across desktop, tablet, and mobile devices.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?style=flat&logo=vercel)](https://task-manager-frontend-lake-seven.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render)](https://task-manager-backend-767m.onrender.com)
[![React](https://img.shields.io/badge/React-19.1-blue?style=flat&logo=react)](https://react.dev)
[![Flask](https://img.shields.io/badge/Flask-2.3-lightgrey?style=flat&logo=flask)](https://flask.palletsprojects.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## 🌐 Live Deployments

- **Frontend Application:** [https://task-manager-frontend-lake-seven.vercel.app](https://task-manager-frontend-lake-seven.vercel.app)
- **Backend API Service:** [https://task-manager-backend-767m.onrender.com/](https://task-manager-backend-767m.onrender.com/)

---

## 📚 Project Documentation

Detailed technical documentation is available in the [`docs/`](./docs) folder:

- 🏗️ **[System Architecture](./docs/ARCHITECTURE.md):** Complete component tree, data flow, ER diagram, and deployment topology.
- 📊 **[Codebase Status & Audit](./docs/STATUS.md):** Current state, bug fixes applied, and feature audit matrix.
- 🗺️ **[Product Roadmap](./docs/ROADMAP.md):** Multi-device UI design, mobile vs desktop ergonomics, and phased sprint plan.
- 🔌 **[REST API Specification](./docs/API.md):** Authentication, task CRUD endpoints, payloads, and response structures.

---

## 🚀 Key Features

- **🔐 Robust Authentication:** Secure user registration & login backed by Bcrypt password hashing and JWT token security.
- **⚡ Snappy Task Management:** Create, view, update, and delete tasks with instant optimistic UI updates.
- **📱 Responsive by Design:** Engineered to adapt smoothly from mobile screens (compact cards) to large desktop monitors.
- **🪶 Lightweight & Zero Bloat:** Built with Vanilla CSS design tokens and React 19 for maximum speed and zero heavy UI dependency overhead.
- **☁️ Cloud Native Architecture:** Render-hosted Flask backend with PostgreSQL, and Vercel-hosted Vite frontend.

---

## 🛠️ Tech Stack

| Tier | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, React Router DOM 7, Axios, Vanilla CSS (CSS Variables) |
| **Backend** | Python 3.11+, Flask 2.3, Flask-SQLAlchemy, Flask-Bcrypt, Flask-JWT-Extended, Flask-CORS, Gunicorn |
| **Database** | SQLite (Local Development) / PostgreSQL (Production) |
| **Hosting & CI/CD** | Vercel (Frontend SPA) + Render (Backend Web Service) |

## 🐳 Docker Setup (Recommended)

Run the entire full-stack application (Frontend + Backend + Database) with a single command:

```bash
# Start Frontend, Backend & SQLite persistence
docker compose up -d --build

# View container logs
docker compose logs -f

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

## 💻 Manual Development Setup (Without Docker)

### 1. Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+) & pip

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run development server (runs on http://localhost:5000)
python app.py
```

### 3. Frontend Setup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env

# Run development server (runs on http://localhost:5173)
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.
