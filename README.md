# Task Management — React + Node + Google Sheets

A monorepo task tracker. **React (Vite + TypeScript + Tailwind)** for the UI, **Node + Express + googleapis** for the backend, with **Google Sheets as the database** via a service account. Mirrors the AIC inventory app architecture.

```
.
├── server/   Node + Express + googleapis (service account auth)
└── client/   Vite + React + TypeScript + Tailwind
```

**Database (Google Sheet):** https://docs.google.com/spreadsheets/d/1CXjabXedktYGcTPbKB-BGspeRXNOvML6u3wBeqln8VE/edit

**Sheet tabs the server reads/writes:**
- `TaskManagement` — tasks (14 columns: id, title, description, link, priority, status, dueDate, labels, project, reminderDate, assignedTo, assignedBy, createdAt, updatedAt)
- `DD_Projects`, `DD_Labels`, `DD_Users` — dropdown lookup tables (id, name)

The server auto-creates any missing tab on first request, so you can point at an empty sheet.

## One-time setup

You only do these steps once.

### 1. Google Cloud — service account

1. Go to <https://console.cloud.google.com/> and create a new project (e.g. `task-management`).
2. Enable the **Google Sheets API** for the project (APIs & Services → Library).
3. Go to **APIs & Services → Credentials → Create Credentials → Service Account**. Give it a name; skip the optional steps.
4. Open the service account, **Keys → Add Key → JSON**. Save the downloaded file.
5. Move the JSON file to `server/credentials/sa.json` (folder is gitignored).
6. Open the service account details and copy its email (looks like `name@project.iam.gserviceaccount.com`).

### 2. Share the sheet with the service account

1. Open your task-management Google Sheet in the browser.
2. Click **Share**, paste the service account email, give it **Editor** access, and confirm.
3. Copy the sheet ID from the URL: `https://docs.google.com/spreadsheets/d/<THIS_PART>/edit`.

### 3. Configure the server `.env`

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```
SHEET_ID=your_sheet_id_here
GOOGLE_APPLICATION_CREDENTIALS=./credentials/sa.json
PORT=4000
```

### 4. Install and run

From the **repo root**:

```bash
npm install        # installs both server and client workspaces
npm run dev        # runs server (http://localhost:4000) and client (http://localhost:5173) together
```

Open <http://localhost:5173/task-management/>. The Vite dev server proxies `/api` to Express, so no extra config is needed.

## How the data flows

- The React app calls `/api/*` on the Node server (never Google directly).
- The Node server uses the **service account** (`googleapis` library) to read/write the sheet tabs above.
- Tasks are normalized in `server/src/normalize.ts` — `labels` is stored pipe-delimited in the sheet (`design|backend`) for spreadsheet readability and exposed as a string array on the API.
- If the API server is down, the React app automatically falls back to **local-storage mode** (banner turns amber). Click **Retry API** in the banner to re-attempt the connection.

## API endpoints

| Method | Path | Purpose |
|---|---|---|
| GET    | `/api/health` | Liveness check |
| GET    | `/api/bootstrap` | All tasks + dropdowns + statuses + priorities |
| POST   | `/api/tasks` | Create a task |
| PATCH  | `/api/tasks/:id` | Patch a task (partial update) |
| PATCH  | `/api/tasks/:id/status` | Update status only (Kanban drag) |
| DELETE | `/api/tasks/:id` | Delete a task (idempotent) |
| POST   | `/api/dropdowns/:kind` | Add a project / label / user |
| DELETE | `/api/dropdowns/:kind/:id` | Delete one (idempotent) |

`:kind` ∈ `projects | labels | users`.

## Production deployment

The current GitHub Pages workflow (`.github/workflows/deploy.yml`) builds and deploys only the `client/`. GitHub Pages cannot run Node, so the deployed site at **devmehedi17061.github.io/task-management** runs in **local-storage-only mode** (no sheet sync).

To enable Sheet sync in production, deploy the server to a Node host (Vercel serverless functions are the easiest — see `D:\demo\aic\vercel.json` and `D:\demo\aic\api\index.js` for a working template), then set `VITE_API_BASE=/api` at client build time.

## Troubleshooting

- **403 on first request** — sheet was not shared with the service account email. Re-check setup step 2.
- **`Sheet "TaskManagement" not found`** — the server auto-creates tabs, so this only fires if `SHEET_ID` is wrong or the service account lacks Editor access.
- **API server log shows `[sheets] No credentials configured`** — `server/.env` is missing or `GOOGLE_APPLICATION_CREDENTIALS` doesn't point at a real file.
- **Banner stays amber after starting the server** — open <http://localhost:4000/api/health>; if you don't get `{"ok":true}`, the server didn't start. Check the server log stream for the actual error.
- **`SHEET_ID` looks right but bootstrap returns empty** — the spreadsheet exists but has no tabs the server recognizes; the first request auto-creates them with empty data.

## Tech stack

- **Backend:** Node 18+, Express, googleapis, dotenv, cors. TypeScript via tsx (no build step in dev).
- **Frontend:** Vite 5, React 18, TypeScript, Tailwind CSS, TanStack Query, @dnd-kit, Headless UI, lucide-react.
- **Hosting:** GitHub Pages for the client (static, local-mode only). Server is local-only by default.

---

## 🇧🇩 বাংলা সংক্ষিপ্ত setup

### Step 1: Service Account JSON download করো

1. <https://console.cloud.google.com/> এ যাও → **New Project** (নাম: `task-management`)
2. **APIs & Services → Library** → search **Google Sheets API** → **Enable**
3. **APIs & Services → Credentials → Create Credentials → Service Account** → name `task-sheets` → Done
4. Service account এ click → **Keys → Add Key → Create new key → JSON**
5. Download হওয়া JSON file rename করো → `sa.json`, রাখো `D:\demo\task-management\server\credentials\sa.json`

### Step 2: Sheet share করো

1. `sa.json` file open করো (Notepad)
2. `"client_email": "task-sheets@task-management.iam.gserviceaccount.com"` line এর email copy করো
3. Google Sheet open করো → **Share → paste email → Editor → Send**

### Step 3: `.env` setup

`D:\demo\task-management\server\.env.example` কে copy করে `.env` বানাও, এই content দাও:

```
SHEET_ID=1CXjabXedktYGcTPbKB-BGspeRXNOvML6u3wBeqln8VE
GOOGLE_APPLICATION_CREDENTIALS=./credentials/sa.json
PORT=4000
```

### Step 4: Run

```
cd D:\demo\task-management
npm install
npm run dev
```

সব ঠিক থাকলে:

- Server → <http://localhost:4000>
- Client → <http://localhost:5173/task-management/>
- Banner সবুজ হবে → Sheet সরাসরি update হবে ✅

---

**Flow:** `React (client)` → `/api/*` → `Express (server)` → `googleapis` → `Google Sheet`
