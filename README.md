# Frontend Client — Smart Project & Task Collaboration System

A premium client application built with Next.js 16 (App Router) and styled with Tailwind CSS v4. The system leverages state separation: Zustand strictly manages client-side UI states, while TanStack Query abstracts, synchronizes, and caches server-side resource queries.

---

## 🔐 NextAuth.js v5 Integration

- **Authorization Callback (`src/auth.ts`)**: Implements standard Credentials login flow. Submits input values to the Express backend API and updates JWT session tokens with user parameters (`id`, `name`, `email`, `role`, `avatarUrl`, `accessToken`).
- **Middleware Guard (`src/middleware.ts`)**: Intercepts requests. Unauthenticated users are redirected to `/login`, while logged-in users attempting to access onboarding/login pages redirect straight to the main workspace.

---

## 📦 Zustand State Management (UI State)

We isolate server cache syncs from transient client states by keeping all database entities in TanStack Query. Zustand handles the following UI-specific drawers:

1. **`themeStore`**: Manages light/dark transitions.
2. **`sidebarStore`**: Toggle variables for responsive collapsible menus.
3. **`modalStore`**: Toggles dialog states (e.g. `isCreateProjectOpen`, `isEditTaskOpen`).
4. **`filterStore`**: Tracks active global search tokens, project statuses, and task priority arrays.
5. **`notificationStore`**: Handles real-time client-side alerts received via WebSocket.

---

## 🔄 TanStack Query v6 & Axios Hook Layer

API requests utilize a custom Axios client (`src/lib/axios.ts`) which intercepts requests to attach the `Authorization: Bearer <token>` header from the active NextAuth session. Custom query hooks (`src/hooks/`) automate caching, loading state flags, and auto-invalidation:

- `useProjects()` / `useCreateProject()`
- `useTasks(projectId)` / `useUpdateTaskStatus()`
- `useComments(taskId)` / `useCreateComment()`
- `useTeamWorkloads()`

For example, moving a card on the Kanban board triggers a mutation that instantly invalidates the query cache, prompting React Query to fetch fresh layout metrics in the background.

---

## 🎨 Tailwind CSS v4 Design & Theming

The client uses Tailwind CSS v4 featuring class-based dark mode toggles:
- **Variant mapping (`src/app/globals.css`)**:
  ```css
  @variant dark (&:where(.dark, .dark *));
  ```
  This custom variant translates the `.dark` class added to `html` by `next-themes` directly to `dark:` utility states.
- **Premium Theming**: Redefines the standard `violet` palette to represent **Warm Sand** (`#C9A66B`) and updates the `zinc` variables in `.dark` to represent **Linear-style deep dark colors** (background: `#080710`, surfaces: `#14151F`).

---

## ⚡ Development & Launch

Ensure the backend Express server is running on port 5000 before starting:

```bash
# Install packages
npm install

# Start Next.js App dev mode
npm run dev

# Verify types and build production code
npm run build
```
