# Product & Engineering Roadmap — Task Manager Pro

**Vision:** Build a blazingly fast, lightweight, and versatile "All-Rounder Task Manager Pro" that delivers an uncompromising experience across mobile phones, tablets, and large desktop screens without dependency bloat.

---

## 1. Guiding Principles

1. **Zero Bloat & Lightweight Architecture:**  
   Avoid heavy UI component libraries. Use tailored Vanilla CSS with CSS custom properties (variables) for fast initial paint, negligible JavaScript bundle impact, and total styling freedom.
2. **Device-Adaptive Ergonomics:**  
   - **Small Screens (Mobile):** Single-hand operation, bottom navigation, floating action button (FAB), swipe actions, clean bottom sheets for modals.
   - **Large Screens (Desktop/Tablet):** Information-dense multi-column layout, collapsible sidebar, Kanban board and calendar views, keyboard shortcuts.
3. **All-Rounder Task Capabilities:**  
   Support diverse workflows (GTD, Eisenhower matrix, simple checklists, project boards) through priorities, custom tags, due dates, and status stages.
4. **Snappy & Resilient:**  
   Optimistic UI updates, instant search/filtering, and local caching fallback.

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
│ ⭐ Priority  │ [x] Task 3   [Low]  [Side]  Done   │ - Subtasks (2/3)   │
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
│  [📋 Tasks]   [📊 Stats]   [⚙️ More] │  <- Bottom App Navigation
└──────────────────────────────────────┘
```

---

## 3. Phased Implementation Roadmap

### Phase 1: Modern Lightweight Design System & Foundation (Sprint 1)
- [ ] **Design Tokens & Theme Engine:**
  - Define semantic CSS variables in `index.css` (primary accent, secondary accent, card surfaces, border gradients, text contrasts).
  - Implement a sleek Dark Mode & Light Mode switch with user preference persistence.
  - Subtle micro-animations (card entry, checkmark bounce, hover elevation).
- [ ] **Route Integration with React Router DOM:**
  - Replace view state string switches with explicit routes (`/login`, `/register`, `/app`, `/app/tasks`, `/app/board`).
  - Auth guards (`ProtectedRoute` component) redirecting unauthorized users cleanly.
- [ ] **Modern Typography & Icons:**
  - Fast-loading system font stack or Inter font.
  - Lightweight SVG icon set (lucide/feather style SVGs) embedded without bulky icon libraries.

---

### Phase 2: Core Task Model & API Expansion (Sprint 2)
- [ ] **Database Schema Upgrade (`models.py`):**
  - `priority`: Enum or String (`'low'`, `'medium'`, `'high'`, `'urgent'`).
  - `category` / `tags`: Comma-separated or tag association.
  - `status`: String (`'todo'`, `'in_progress'`, `'completed'`).
  - `subtasks`: Lightweight JSON field or related subtask items.
  - `updated_at`: Auto-timestamp for change tracking.
- [ ] **Enhanced Backend Endpoints (`routes.py`):**
  - Support query filters on `GET /api/tasks` (e.g., `?priority=high&status=todo&search=design`).
  - Validation decorators for title presence and length.
- [ ] **Frontend Model Adaptation:**
  - Expand `TaskForm` to include priority picker, category/tag selection, and due date.
  - Expand `TaskItem` to render color-coded priority pills and category badges.

---

### Phase 3: Dual-Screen Ergonomics & Views (Sprint 3)
- [ ] **Desktop & Large Screen Features:**
  - **Collapsible Sidebar:** Navigation tree with quick filters (Inbox, Today, Upcoming, Important, Categories).
  - **Kanban Board View:** Drag-and-drop or column-based task states (To-Do, In Progress, Done).
  - **Keyboard Shortcuts:** `N` for new task, `/` or `Ctrl+K` for search, `Esc` to close modals.
- [ ] **Mobile & Small Screen Features:**
  - **Native-feel Bottom Navigation:** Fast tab switching between Tasks, Board, and Stats.
  - **Floating Action Button (FAB):** Fixed bottom-right quick-add button for one-handed operation.
  - **Bottom Sheet Modal:** Slide-up creation and editing drawer on mobile instead of intrusive center modals.
  - **Swipe Actions:** Swipe right to complete, swipe left to delete.

---

### Phase 4: Productivity & All-Rounder Power Tools (Sprint 4)
- [ ] **Instant Client-Side Search & Multi-Filters:**
  - Real-time search with fuzzy matching on title and description.
  - Quick filter chips: "Due Today", "Overdue", "High Priority", "Work", "Personal".
- [ ] **Productivity Analytics & Streaks:**
  - Completion percentage progress bars.
  - Daily completion streaks and weekly productivity charts.
- [ ] **Bulk Task Actions:**
  - Multi-select tasks for batch delete, mark as completed, or re-prioritize.

---

### Phase 5: Resilience, Offline & Deployment Polish (Sprint 5)
- [ ] **Offline Resilience & PWA:**
  - Web App Manifest and Service Worker for "Add to Home Screen" on iOS & Android.
  - LocalStorage optimistic caching to allow viewing and editing tasks when offline.
- [ ] **Security Hardening:**
  - JWT Refresh Token rotation.
  - Email format and password complexity validation on both frontend and backend.
- [ ] **Automated CI/CD Verification:**
  - Automated build checks for Vite and Flask before deployment.
