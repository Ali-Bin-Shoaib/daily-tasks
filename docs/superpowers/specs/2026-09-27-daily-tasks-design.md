# Daily tasks

A one-screen app for the current local day. Tasks are saved in the browser now. The screen talks only to a `TaskRepository`, so a SQL backend can replace `localStorage` later.

## Behavior

- Add a task, edit its title, mark it complete, or delete it.
- A title is required. Leading and trailing spaces are removed. An empty title is rejected.
- Completed tasks stay on the list for the rest of today.
- The screen shows only the current local date. After local midnight, or when the tab becomes visible on a new day, the list is that new day’s tasks.
- Older days stay in storage and are never listed in this version.
- If browser storage is missing, unreadable, or full, the page shows an error and keeps running.

## Data

```ts
type Task = {
  id: string
  title: string
  completed: boolean
  date: string // local YYYY-MM-DD
  createdAt: string // ISO
  updatedAt: string // ISO
}
```

Storage key: `daily-tasks:v1`. Value: `{ version: 1, tasks: Task[] }`.

```ts
interface TaskRepository {
  listByDate(date: string): Promise<Task[]>
  create(input: { title: string; date: string }): Promise<Task>
  update(id: string, patch: { title?: string; completed?: boolean }): Promise<Task>
  delete(id: string): Promise<void>
}
```

`getTaskRepository()` is the only place the app chooses an implementation. The first implementation is `localStorage`.

## App

- Vite, React, and TypeScript.
- TanStack Router with one route, `/`.
- TanStack Query for the day’s list and for create, update, and delete.
- TanStack Form for the add form and the edit form.
- Local dev is served at `/`. The GitHub Pages build uses base path `/daily-tasks/`.

## Deploy

- Private GitHub repository `Ali-Bin-Shoaib/daily-tasks`.
- Pushes to `main` run tests and publish `dist` with GitHub Actions.
- Public site: `https://ali-bin-shoaib.github.io/daily-tasks/`.
- The repository stays private. The published Pages site is public.

## Tests

Repository tests cover listing by date, create, update, delete, blank titles, corrupt storage, and a full `localStorage`.

## Out of scope

Accounts, a history screen, the SQL implementation, recurring tasks, and drag-and-drop ordering.
