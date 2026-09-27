# Daily tasks

A one-page list for today. Tasks stay in the browser for now. The screen uses a `TaskRepository`, so a SQL backend can replace `localStorage` later without rewriting the page.

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173/.

```bash
pnpm test
pnpm build
pnpm preview
```

## Storage

Tasks are saved in `localStorage` under `daily-tasks:v1`, with the local date they belong to. The page lists only today. Older days remain stored.

`getTaskRepository()` in `src/tasks/repository.ts` is the swap point. Implement `TaskRepository` from `src/tasks/types.ts` against SQL, and change that function.

## GitHub Pages

Pushes to `main` publish the site. The repository is private. The published site is public:

https://ali-bin-shoaib.github.io/daily-tasks/
