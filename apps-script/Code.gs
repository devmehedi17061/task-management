/**
 * Task Management — Apps Script Web App backend
 *
 * Bind this script to your Google Sheet (Extensions → Apps Script).
 * Deploy: Deploy → New deployment → Web app
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Copy the /exec URL into the React app's .env.local as VITE_APPS_SCRIPT_URL.
 */

// Pin the backend to this specific Google Sheet so the script works whether
// it is deployed standalone or bound to a spreadsheet.
// https://docs.google.com/spreadsheets/d/1CXjabXedktYGcTPbKB-BGspeRXNOvML6u3wBeqln8VE/edit
const SHEET_ID = '1CXjabXedktYGcTPbKB-BGspeRXNOvML6u3wBeqln8VE';

function ss_() {
  return SpreadsheetApp.openById(SHEET_ID);
}

const SHEETS = {
  tasks: 'TaskManagement',
  projects: 'DD_Projects',
  labels: 'DD_Labels',
  users: 'DD_Users',
};

const TASK_HEADERS = [
  'id', 'title', 'description', 'link',
  'priority', 'status', 'dueDate', 'labels',
  'project', 'reminderDate', 'assignedTo', 'assignedBy',
  'createdAt', 'updatedAt',
];

const DROPDOWN_HEADERS = ['id', 'name'];

const PRIORITIES = ['High', 'Medium', 'Low'];
const STATUSES = ['To Do', 'In Progress', 'Done', 'Archived'];

// ---------- HTTP entry points ----------

function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || 'bootstrap';
    if (action === 'bootstrap') return jsonOut_(bootstrap_());
    if (action === 'info')      return jsonOut_(info_());
    return jsonOut_({ error: 'Unknown GET action: ' + action });
  } catch (err) {
    return jsonOut_({ error: String(err && err.message || err) });
  }
}

// Diagnostic: returns the spreadsheet this deployment is actually writing to.
// Hit <your /exec URL>?action=info in a browser to confirm SHEET_ID is pinned
// to the sheet you expect.
function info_() {
  const ss = ss_();
  return {
    sheetId: SHEET_ID,
    spreadsheetName: ss.getName(),
    spreadsheetUrl: ss.getUrl(),
    sheets: ss.getSheets().map(function (sh) { return sh.getName(); }),
    deployedAt: new Date().toISOString(),
  };
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const action = body.action;
    switch (action) {
      case 'createTask':     return jsonOut_({ task: createTask_(body.task) });
      case 'updateTask':     return jsonOut_({ task: updateTask_(body.id, body.patch) });
      case 'updateStatus':   return jsonOut_({ ok: updateStatus_(body.id, body.status) });
      case 'deleteTask':     return jsonOut_({ ok: deleteTask_(body.id) });
      case 'addDropdown':    return jsonOut_(addDropdown_(body.kind, body.name));
      case 'deleteDropdown': return jsonOut_({ ok: deleteDropdown_(body.kind, body.id) });
      default: return jsonOut_({ error: 'Unknown POST action: ' + action });
    }
  } catch (err) {
    return jsonOut_({ error: String(err && err.message || err) });
  }
}

// ---------- Bootstrap ----------

function bootstrap_() {
  ensureSheets_();
  return {
    tasks: getRows_(SHEETS.tasks, TASK_HEADERS).map(normalizeTask_),
    projects: getRows_(SHEETS.projects, DROPDOWN_HEADERS),
    labels: getRows_(SHEETS.labels, DROPDOWN_HEADERS),
    users: getRows_(SHEETS.users, DROPDOWN_HEADERS),
    statuses: STATUSES,
    priorities: PRIORITIES,
  };
}

// ---------- Tasks ----------

function createTask_(input) {
  const sheet = sheet_(SHEETS.tasks);
  const now = new Date().toISOString();
  const task = {
    id: Utilities.getUuid(),
    title: input.title || '',
    description: input.description || '',
    link: input.link || '',
    priority: input.priority || 'Medium',
    status: input.status || 'To Do',
    dueDate: input.dueDate || '',
    labels: Array.isArray(input.labels) ? input.labels.join('|') : (input.labels || ''),
    project: input.project || '',
    reminderDate: input.reminderDate || '',
    assignedTo: input.assignedTo || '',
    assignedBy: input.assignedBy || '',
    createdAt: now,
    updatedAt: now,
  };
  sheet.appendRow(TASK_HEADERS.map(function (h) { return task[h]; }));
  return normalizeTask_(task);
}

function updateTask_(id, patch) {
  const { sheet, rowIndex, row } = findRow_(SHEETS.tasks, TASK_HEADERS, id);
  if (rowIndex < 0) throw new Error('Task not found: ' + id);
  const updated = Object.assign({}, row, patch || {}, { updatedAt: new Date().toISOString() });
  if (Array.isArray(updated.labels)) updated.labels = updated.labels.join('|');
  sheet.getRange(rowIndex, 1, 1, TASK_HEADERS.length)
       .setValues([TASK_HEADERS.map(function (h) { return updated[h]; })]);
  return normalizeTask_(updated);
}

function updateStatus_(id, status) {
  const { sheet, rowIndex } = findRow_(SHEETS.tasks, TASK_HEADERS, id);
  if (rowIndex < 0) throw new Error('Task not found: ' + id);
  const statusCol = TASK_HEADERS.indexOf('status') + 1;
  const updatedAtCol = TASK_HEADERS.indexOf('updatedAt') + 1;
  sheet.getRange(rowIndex, statusCol).setValue(status);
  sheet.getRange(rowIndex, updatedAtCol).setValue(new Date().toISOString());
  return true;
}

function deleteTask_(id) {
  const { sheet, rowIndex } = findRow_(SHEETS.tasks, TASK_HEADERS, id);
  // Idempotent: if the row is already gone (e.g. removed directly in the
  // sheet) there's nothing to do — return success so the client doesn't
  // surface a "not found" error and fall back to local mode.
  if (rowIndex < 0) return true;
  sheet.deleteRow(rowIndex);
  return true;
}

// ---------- Dropdowns ----------

function addDropdown_(kind, name) {
  const sheetName = SHEETS[kind];
  if (!sheetName) throw new Error('Unknown dropdown kind: ' + kind);
  const sheet = sheet_(sheetName);
  const id = Utilities.getUuid();
  sheet.appendRow([id, name]);
  return { id: id, name: name };
}

function deleteDropdown_(kind, id) {
  const sheetName = SHEETS[kind];
  if (!sheetName) throw new Error('Unknown dropdown kind: ' + kind);
  const { sheet, rowIndex } = findRow_(sheetName, DROPDOWN_HEADERS, id);
  if (rowIndex < 0) return true;
  sheet.deleteRow(rowIndex);
  return true;
}

// ---------- Helpers ----------

function ensureSheets_() {
  const ss = ss_();
  ensureSheetWithHeaders_(ss, SHEETS.tasks, TASK_HEADERS);
  ensureSheetWithHeaders_(ss, SHEETS.projects, DROPDOWN_HEADERS);
  ensureSheetWithHeaders_(ss, SHEETS.labels, DROPDOWN_HEADERS);
  ensureSheetWithHeaders_(ss, SHEETS.users, DROPDOWN_HEADERS);
}

function ensureSheetWithHeaders_(ss, name, headers) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
    return;
  }
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    sh.setFrozenRows(1);
  }
}

function sheet_(name) {
  const sh = ss_().getSheetByName(name);
  if (!sh) throw new Error('Missing sheet: ' + name);
  return sh;
}

function getRows_(name, headers) {
  const sh = sheet_(name);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  const headerRow = sh.getRange(1, 1, 1, headers.length).getValues()[0]
                      .map(function (h) { return String(h || ''); });
  const values = sh.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values.map(function (row) {
    const obj = {};
    for (let i = 0; i < headers.length; i++) {
      const key = headerRow[i] || headers[i];
      obj[key] = row[i] === '' || row[i] === null ? '' : row[i];
    }
    return obj;
  }).filter(function (r) { return r.id; });
}

function findRow_(sheetName, headers, id) {
  const sh = sheet_(sheetName);
  const lastRow = sh.getLastRow();
  if (lastRow < 2) return { sheet: sh, rowIndex: -1, row: null };
  const values = sh.getRange(2, 1, lastRow - 1, headers.length).getValues();
  for (let i = 0; i < values.length; i++) {
    if (values[i][0] === id) {
      const row = {};
      for (let j = 0; j < headers.length; j++) row[headers[j]] = values[i][j];
      return { sheet: sh, rowIndex: i + 2, row: row };
    }
  }
  return { sheet: sh, rowIndex: -1, row: null };
}

function normalizeTask_(t) {
  return {
    id: String(t.id || ''),
    title: String(t.title || ''),
    description: String(t.description || ''),
    link: String(t.link || ''),
    priority: String(t.priority || 'Medium'),
    status: String(t.status || 'To Do'),
    dueDate: toIso_(t.dueDate),
    labels: String(t.labels || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean),
    project: String(t.project || ''),
    reminderDate: toIso_(t.reminderDate),
    assignedTo: String(t.assignedTo || ''),
    assignedBy: String(t.assignedBy || ''),
    createdAt: toIso_(t.createdAt),
    updatedAt: toIso_(t.updatedAt),
  };
}

function toIso_(v) {
  if (!v) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function jsonOut_(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
