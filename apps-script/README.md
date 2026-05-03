# Apps Script backend — deploy steps

This backend is **pinned to a specific Google Sheet** via the `SHEET_ID` constant at the top of [`Code.gs`](./Code.gs):

> https://docs.google.com/spreadsheets/d/1CXjabXedktYGcTPbKB-BGspeRXNOvML6u3wBeqln8VE/edit

The script always reads/writes that spreadsheet, regardless of whether it is deployed standalone or bound to a sheet. Anyone deploying must have **Editor** access to that sheet (the script runs *as you* and needs write permission).

## Deploy

1. Open the sheet linked above. Confirm you have Editor access. If not, ask the owner to share it with you.
2. **Extensions → Apps Script** from inside that sheet (this creates a bound script — the simplest path; standalone scripts also work since `Code.gs` opens the sheet by ID).
3. Replace the default `Code.gs` with the contents of [`Code.gs`](./Code.gs) in this folder. Save.
4. *(Optional, if you want to use a different sheet)* change the `SHEET_ID` constant at the top of `Code.gs` to your own sheet's ID — the long string between `/d/` and `/edit` in the sheet URL.
5. Click **Deploy → New deployment**.
   - **Type:** Web app
   - **Description:** `Task Management API`
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*
6. Click **Deploy** and authorize when prompted (grants Sheets read/write on your behalf).
7. Copy the **Web app URL** (ends in `/exec`) and put it in two places:
   - **Local dev:** `D:\demo\task-management\.env.local`
     ```
     VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
     ```
   - **GitHub Pages build:** repo **Settings → Secrets and variables → Actions → Variables**, set `VITE_APPS_SCRIPT_URL` to the same value (consumed by `.github/workflows/deploy.yml`).
8. Restart `npm run dev` so Vite picks up the env var.

## Notes

- The script auto-creates any missing sheets (`TaskManagement`, `DD_Projects`, `DD_Labels`, `DD_Users`) with the right headers on first use, *inside the spreadsheet identified by `SHEET_ID`*.
- **Don't rename headers** in row 1 of `TaskManagement` — the script reads/writes by header name. Required headers: `id, title, description, link, priority, status, dueDate, labels, project, reminderDate, assignedTo, assignedBy, createdAt, updatedAt`.
- Labels in the sheet are stored pipe-separated (e.g. `Design|UI/UX`). The React app handles splitting/joining automatically.
- After any code change in the editor, click **Deploy → Manage deployments → Edit** and pick **New version → Deploy**. The `/exec` URL stays the same across new versions of the same deployment, so you only need to refresh `VITE_APPS_SCRIPT_URL` if you create a *brand-new* deployment.

## Troubleshooting

- **"Authorization required"** — open the script editor, click **Run** on `bootstrap_`, accept the OAuth prompts, then re-deploy.
- **"You do not have permission to access the requested document"** — `SHEET_ID` points to a sheet your Google account cannot edit. Share the sheet with yourself as Editor, or change `SHEET_ID` to a sheet you own.
- **CORS errors in browser** — make sure you used the `/exec` URL, not `/dev`. Only `/exec` is publicly accessible.
- **Empty response** — the deployment may need to be re-saved as a new version after any edits.
