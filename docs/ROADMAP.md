# Product & Engineering Roadmap — Task Manager Pro

**Vision:** Build a blazingly fast, lightweight, and versatile "All-Rounder Task Manager Pro" that delivers an uncompromising experience across mobile phones, tablets, and large desktop screens without dependency bloat.

---

## 1. Guiding Principles

1. **Zero Bloat & Lightweight Architecture:**  
   Avoid heavy UI component libraries. Use tailored Vanilla CSS with CSS custom properties (variables) for fast initial paint, negligible JavaScript bundle impact, and total styling freedom.
2. **Device-Adaptive Ergonomics:**  
   - **Small Screens (Mobile):** Single-hand operation, bottom navigation, floating action button (FAB), touch swipe actions, clean bottom sheets for modals.
   - **Large Screens (Desktop/Tablet):** Information-dense multi-column layout, collapsible sidebar, Kanban board view, spotlight command palette (`Ctrl+K`).
3. **All-Rounder Task Capabilities:**  
   Support diverse workflows (GTD, Kanban, Eisenhower matrix, subtask checklists) through priorities, custom tags, due dates, workflow columns, and velocity analytics.
4. **Snappy & Resilient:**  
   Optimistic UI updates, instant search/filtering, PWA offline caching, and silent JWT token refresh.

---

## 2. Multi-Screen Design Specification

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DESKTOP / LARGE SCREEN VIEW                     │
├──────────────┬────────────────────────────────────┬────────────────────┤
│   SIDEBAR    │          MAIN TASK VIEW            │   DETAILS PANE     │
│              │                                    │                    │
│ [Search Bar] │ [View: List | Board | Calendar]    │ Selected Task:     │
│              │ [Filter: Today | Urgent | Work]    │ - Title            │
│ 📌 Inbox     │                                    │ - Description      │
│ 📅 Today     │ [ ] Task 1   [High] [Work]  Today  │ - Due Date/Time    │
│ 🗓️ Upcoming  │ [ ] Task 2   [Med]  [Life]  Tomorrow│ - Priority: High  │
│ 📊 Stats     │ [x] Task 3   [Low]  [Side]  Done   │ - Subtasks (2/3)   │
│ 🏷️ Tags      │                                    │ - Activity History │
│ ⚙️ Settings  │                                    │ [Delete] [Save]    │
└──────────────┴────────────────────────────────────┴────────────────────┘

┌──────────────────────────────────────┐
│          MOBILE SCREEN VIEW          │
├──────────────────────────────────────┤
│  ≡  Task Manager Pro        🔍  👤   │
├──────────────────────────────────────┤
│  [All (12)] [Today (4)] [Urgent (2)] │
├──────────────────────────────────────┤
│  [ ] Finish documentation            │
│      📅 Today  ·  🔴 High  ·  💼 Work │
│                                      │
│  [ ] Review backend tests            │
│      📅 Tomorrow · 🟡 Medium · 💻 Code│
│                                      │
│  [x] Deploy to production            │
│      ✔️ Completed                     │
├──────────────────────────────────────┤
│                      ┌───┐           │
│                      │ + │ (FAB)     │
│                      └───┘           │
├──────────────────────────────────────┤
│  [📋 Tasks] [📋 Board] [📊 Stats]    │  <- Fixed Mobile Bottom Navigation
└──────────────────────────────────────┘
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Modern Lightweight Design System & Foundation [COMPLETED]
- [x] **Design Tokens & Theme Engine:**
  - Semantic CSS variables in `index.css` and `App.css` (Obsidian / Zinc tokens).
  - Dark Mode & Light Mode switch with user preference persistence.
- [x] **Route Integration with React Router DOM:**
  - Declarative routes (`/login`, `/register`, `/app/:section`, `/app/board`, `/app/stats`).
  - Auth guards (`ProtectedRoute` component) redirecting unauthorized users cleanly.
- [x] **Modern Typography & Icons:**
  - Lightweight pure SVG icons embedded without bulky icon libraries.

---

### Phase 2: Core Task Model & API Expansion [COMPLETED]
- [x] **Database Schema Upgrade (`models.py`):**
  - `priority`: String (`low`, `medium`, `high`, `urgent`).
  - `category`: String tags (`Engineering`, `Design`, `Work`, `Personal`).
  - `status`: String (`todo`, `in_progress`, `done`).
  - `subtasks`: Lightweight JSON field with auto-migration.
  - `updated_at` & `completed_at`: Timestamps for change & velocity tracking.
- [x] **Enhanced Backend Endpoints (`routes.py`):**
  - Multi-criteria query filters on `GET /api/tasks` (`status`, `priority`, `category`, `completed`, `search`, `sort_by`).
- [x] **Frontend Model Adaptation:**
  - Color-coded priority pills, category badges, and interactive due date badges.

---

### Phase 3: Dual-Screen Ergonomics & Views [COMPLETED]
- [x] **Desktop & Large Screen Features:**
  - **Collapsible Sidebar:** Navigation tree with quick filters (Inbox, Today, Upcoming, Completed, Board, Stats, Tags).
  - **Kanban Board View:** 3-column drag-and-drop task board (`To Do`, `In Progress`, `Done`) via `@dnd-kit/core`.
  - **Global Command Palette:** Spotlight modal (`Ctrl+K` / `Cmd+K`) with live search, action dispatch, and keyboard cyclic navigation.
- [x] **Mobile & Small Screen Features:**
  - **Native Bottom Navigation:** 4-tab bar (Tasks, Board, Stats, Rhythm) with safe-area insets.
  - **Floating Action Button (FAB):** Fixed bottom-right quick-add button positioned above bottom navigation.
  - **Bottom Sheet Modal:** Drag-to-dismiss creation drawer on mobile.
  - **Touch Swipe Actions:** Axis-locked directional swipes (swipe right to complete, swipe left to delete).

---

### Phase 4: Productivity & All-Rounder Power Tools [COMPLETED]
- [x] **Instant Client-Side Search & Multi-Filters:**
  - Real-time search with fuzzy matching on title, description, and tags.
  - Quick filter chips: "All", "🔴 Urgent", "🟠 High", "Work", "Personal", etc.
- [x] **Productivity Analytics & Velocity Curves (`/app/stats`):**
  - Pure SVG 14-day completion velocity area chart with interactive tooltip nodes.
  - Daily consistency streak counter (Current & Best records).
  - Category breakdown bars and urgency tier distribution matrix.
- [x] **Nested Subtasks & Checklist Builders:**
  - Relational subtask checklists on task cards and modals.

---

### Phase 5: Resilience, Offline & Deployment Polish [IN PROGRESS]
- [x] **PWA & Offline Resilience:**
  - Web App Manifest and Service Worker runtime caching for `/api/tasks`.
  - Offline network detection with visual cached state pill.
  - Silent JWT refresh token rotation with Axios 401 retry queue.
- [ ] **Phase 10 — Offline-Write Mutation Queue:**
  - Two-way outbox sync queue in `localStorage` for offline task mutations (`CREATE`, `UPDATE`, `DELETE`).
  - Automatic reconnection drain via `online` event listener.
- [ ] **Phase 11 — CD Pipeline:**
  - Automated GitHub Actions CD workflow (`cd.yml`) publishing container images to GitHub Container Registry (GHCR).
