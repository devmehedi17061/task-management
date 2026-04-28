# Task Management — React + Google Sheets

A fast Vite + React + TypeScript + Tailwind app that turns your Google Sheet into a task tracker with a filterable table view, a drag-and-drop Kanban board, and a dropdowns manager. Backed by a small Apps Script Web App that talks to the sheet directly.

## Quick start

```bash
# 1. Deploy the Apps Script backend
#    See ./apps-script/README.md for full steps.
#    Copy the /exec URL when you're done.

# 2. Configure the frontend
cp .env.example .env.local
# Paste your /exec URL into .env.local

# 3. Install + run
npm install
npm run dev
```

Open `http://localhost:5173`.

## Features

- **Tasks view** — sortable/filterable table matching the source design (priority badges, status pills, label chips, date pills, project, reminder).
- **Kanban Board** — four columns (To Do / In Progress / Done / Archived) with drag-and-drop status updates and optimistic UI.
- **Dropdowns** — manage Projects, Labels, and Users without leaving the app.
- **Filters** — search by title, priority, status, due-date range, label, and project.
- **Optimistic mutations** via TanStack Query so drag-drop and edits feel instant.

## Project layout

```
apps-script/   Google Apps Script backend (Code.gs + deploy README)
src/
  api/         fetch wrapper around the /exec endpoint
  components/  layout, tasks, kanban, dropdowns, UI primitives
  hooks/       TanStack Query hooks (bootstrap + mutations)
  lib/         types, color tokens, date formatters
  App.tsx      shell + view switching
```

## Sheet schema

`TaskManagement` row 1 must be:
```
id | title | description | link | priority | status | dueDate | labels | project | reminderDate | createdAt | updatedAt
```
Dropdown sheets (`DD_Projects`, `DD_Labels`, `DD_Users`) use:
```
id | name
```
The Apps Script auto-creates any missing sheets/headers on first run.

## Scripts

- `npm run dev` — start Vite dev server on port 5173.
- `npm run build` — type-check + produce a production bundle in `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run typecheck` — TypeScript check only.
# task-management
