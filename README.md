# Kestrel — Focused Task Planner

A clean, keyboard-friendly task planner built with React 19, TypeScript, Vite, and Tailwind CSS v4. Data persists locally in the browser (`localStorage`) with JSON export/import backups, requiring zero backend configuration to deploy on Vercel.

## Features

- **Smart Views & Custom Lists**: Organize work across `Inbox`, `Today`, `Upcoming`, `Completed`, and custom project lists.
- **Rich Task Details**: Priorities (`Low`, `Medium`, `High`), due dates with overdue detection, notes, and interactive subtasks.
- **Instant Search, Filtering & Sorting**: Filter by status or priority, search across titles/notes, and sort by creation order, due date, or priority.
- **Undo & Backup**: Recover accidentally deleted tasks with instant undo, and export/import tasks as JSON.
- **Light & Dark Themes**: Accessible high-contrast light and dark modes.

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Testing & Verification

```bash
npm test
npm run lint
npm run build
```

## Push to GitHub & Deploy to Vercel

1. **Initialize and push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Kestrel todo app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```

2. **Deploy to Vercel**:
   - Go to [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
   - Vercel automatically detects Vite (`vercel.json` is preconfigured with SPA rewrites and security headers).
   - Click **Deploy** (no environment variables required).
