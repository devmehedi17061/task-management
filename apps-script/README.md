# Apps Script backend — deploy steps

1. Open your Google Sheet → **Extensions → Apps Script**.
2. Replace the default `Code.gs` with the contents of [`Code.gs`](./Code.gs) in this folder. Save.
3. Click **Deploy → New deployment**.
   - **Type:** Web app
   - **Description:** `Task Management API`
   - **Execute as:** *Me*
   - **Who has access:** *Anyone*
4. Click **Deploy** and authorize when prompted.
5. Copy the **Web app URL** (ends in `/exec`) and paste it into `D:\demo\task\.env.local` as
   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
   ```
6. Restart `npm run dev` so Vite picks up the env var.

## Notes

- The script auto-creates any missing sheets (`TaskManagement`, `DD_Projects`, `DD_Labels`, `DD_Users`) with the right headers on first use.
- **Don't rename headers** in row 1 of `TaskManagement` — the script reads/writes by header name. Required headers: `id, title, description, link, priority, status, dueDate, labels, project, reminderDate, createdAt, updatedAt`.
- Labels in the sheet are stored pipe-separated (e.g. `Design|UI/UX`). The React app handles splitting/joining automatically.
- After any code change in the editor, click **Deploy → Manage deployments → Edit** and pick **New version** so your `/exec` URL points to the latest code.

## Troubleshooting

- **"Authorization required"** — open the script editor, click **Run** on `bootstrap_`, accept the OAuth prompts, then re-deploy.
- **CORS errors in browser** — make sure you used the `/exec` URL, not `/dev`. Only `/exec` is publicly accessible.
- **Empty response** — the deployment may need to be re-saved as a new version after any edits.
