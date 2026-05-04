import { google, type sheets_v4 } from 'googleapis';
import path from 'node:path';
import fs from 'node:fs';

const SHEET_ID = process.env.SHEET_ID;

if (!SHEET_ID) {
  console.warn('[sheets] SHEET_ID is not set. Configure server/.env before making requests.');
}

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// googleapis' TS types diverge between GoogleAuth<AuthClient> (constructor
// return) and GoogleAuth<JSONClient> (sheets() factory parameter). The runtime
// behavior is identical — we erase the generic to keep the call site clean.
let auth: unknown;
if (process.env.GOOGLE_CREDENTIALS_JSON) {
  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  auth = new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  const credPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!fs.existsSync(credPath)) {
    console.warn(`[sheets] Credentials file not found at ${credPath}. The server will start, but Sheets calls will fail until you fix this.`);
  }
  auth = new google.auth.GoogleAuth({ keyFile: credPath, scopes: SCOPES });
} else {
  console.warn('[sheets] No credentials configured. Set GOOGLE_CREDENTIALS_JSON (production) or GOOGLE_APPLICATION_CREDENTIALS (local).');
  auth = new google.auth.GoogleAuth({ scopes: SCOPES });
}

const sheets: sheets_v4.Sheets = google.sheets({
  version: 'v4',
  auth: auth as Parameters<typeof google.sheets>[0]['auth'],
});

const sheetMetaCache: { byTitle: Record<string, number> | null; fetchedAt: number } = {
  byTitle: null,
  fetchedAt: 0,
};
const SHEET_META_TTL_MS = 60_000;

async function getSheetMeta(): Promise<Record<string, number>> {
  const now = Date.now();
  if (sheetMetaCache.byTitle && now - sheetMetaCache.fetchedAt < SHEET_META_TTL_MS) {
    return sheetMetaCache.byTitle;
  }
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
    fields: 'sheets(properties(sheetId,title))',
  });
  const byTitle: Record<string, number> = {};
  for (const s of res.data.sheets || []) {
    const title = s.properties?.title;
    const sheetId = s.properties?.sheetId;
    if (title != null && sheetId != null) byTitle[title] = sheetId;
  }
  sheetMetaCache.byTitle = byTitle;
  sheetMetaCache.fetchedAt = now;
  return byTitle;
}

export async function getSheetIdByTitle(title: string): Promise<number> {
  const meta = await getSheetMeta();
  if (!(title in meta)) {
    throw new Error(`Sheet "${title}" not found in spreadsheet`);
  }
  return meta[title];
}

export async function getSheetValues(sheetTitle: string): Promise<unknown[][]> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: sheetTitle,
    valueRenderOption: 'UNFORMATTED_VALUE',
    dateTimeRenderOption: 'FORMATTED_STRING',
  });
  return (res.data.values as unknown[][]) || [];
}

export interface SheetRow {
  __row: number;
  [key: string]: unknown;
}

export interface SheetReadResult {
  headers: string[];
  rows: SheetRow[];
}

/**
 * Read a sheet and return rows as objects keyed by header (first row).
 * Filters out rows that are entirely blank.
 * `__row` is the 1-based sheet row number (header is row 1, first data row is 2).
 */
export async function getRowsAsObjects(sheetTitle: string): Promise<SheetReadResult> {
  const values = await getSheetValues(sheetTitle);
  if (values.length === 0) return { headers: [], rows: [] };
  const headers = values[0].map((h) => String(h ?? '').trim());
  const rows: SheetRow[] = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    const isBlank = !row || row.every((c) => c === undefined || c === null || String(c).trim() === '');
    if (isBlank) continue;
    const obj: SheetRow = { __row: i + 1 };
    for (let c = 0; c < headers.length; c++) {
      obj[headers[c]] = row[c] !== undefined ? row[c] : '';
    }
    rows.push(obj);
  }
  return { headers, rows };
}

/**
 * Append a row to a sheet, ordered by the sheet's existing header row.
 * Returns the 1-based row number where the data was written.
 */
export async function appendRow(
  sheetTitle: string,
  rowObj: Record<string, unknown>,
): Promise<number | null> {
  const { headers } = await getRowsAsObjects(sheetTitle);
  const ordered = headers.map((h) => (rowObj[h] !== undefined ? rowObj[h] : ''));
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: sheetTitle,
    valueInputOption: 'USER_ENTERED',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [ordered as (string | number | boolean)[]] },
  });
  const m = res.data.updates?.updatedRange?.match(/!([A-Z]+)(\d+):/);
  return m ? Number(m[2]) : null;
}

/**
 * Update specific columns for a row identified by an ID. Returns the row number,
 * or `null` if no row matched.
 */
export async function updateRowById(
  sheetTitle: string,
  idColumn: string,
  idValue: string,
  patchObj: Record<string, unknown>,
): Promise<number | null> {
  const { headers, rows } = await getRowsAsObjects(sheetTitle);
  const target = rows.find((r) => String(r[idColumn]) === String(idValue));
  if (!target) return null;

  const data: sheets_v4.Schema$ValueRange[] = [];
  for (const [col, val] of Object.entries(patchObj)) {
    const colIdx = headers.indexOf(col);
    if (colIdx === -1) continue;
    const a1 = `${sheetTitle}!${columnLetter(colIdx)}${target.__row}`;
    data.push({ range: a1, values: [[val as string | number | boolean]] });
  }
  if (data.length === 0) return target.__row;

  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data },
  });
  return target.__row;
}

export async function setCell(
  sheetTitle: string,
  rowNumber: number,
  columnName: string,
  value: unknown,
): Promise<void> {
  const { headers } = await getRowsAsObjects(sheetTitle);
  const colIdx = headers.indexOf(columnName);
  if (colIdx === -1) throw new Error(`Column "${columnName}" not found in ${sheetTitle}`);
  const a1 = `${sheetTitle}!${columnLetter(colIdx)}${rowNumber}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: a1,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [[value as string | number | boolean]] },
  });
}

export interface CellPatch {
  row: number;
  column: string;
  value: unknown;
}

export async function batchSetCells(sheetTitle: string, cellPatches: CellPatch[]): Promise<void> {
  if (cellPatches.length === 0) return;
  const { headers } = await getRowsAsObjects(sheetTitle);
  const data: sheets_v4.Schema$ValueRange[] = [];
  for (const p of cellPatches) {
    const colIdx = headers.indexOf(p.column);
    if (colIdx === -1) continue;
    data.push({
      range: `${sheetTitle}!${columnLetter(colIdx)}${p.row}`,
      values: [[p.value as string | number | boolean]],
    });
  }
  if (data.length === 0) return;
  await sheets.spreadsheets.values.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { valueInputOption: 'USER_ENTERED', data },
  });
}

/**
 * Physically delete the row that has idColumn === idValue. Returns true if a
 * row was deleted, false if nothing matched (idempotent).
 */
export async function deleteRowById(
  sheetTitle: string,
  idColumn: string,
  idValue: string,
): Promise<boolean> {
  const { rows } = await getRowsAsObjects(sheetTitle);
  const target = rows.find((r) => String(r[idColumn]) === String(idValue));
  if (!target) return false;
  const sheetId = await getSheetIdByTitle(sheetTitle);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: target.__row - 1,
              endIndex: target.__row,
            },
          },
        },
      ],
    },
  });
  return true;
}

/**
 * Ensure a sheet exists with the given header row. Creates the tab if missing
 * and writes headers when the sheet is empty. Idempotent: existing data is
 * left alone.
 */
export async function ensureSheet(sheetTitle: string, headers: readonly string[]): Promise<void> {
  const meta = await getSheetMeta();
  if (!(sheetTitle in meta)) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: [{ addSheet: { properties: { title: sheetTitle } } }] },
    });
    sheetMetaCache.byTitle = null; // invalidate
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetTitle}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers as unknown as string[]] },
    });
    return;
  }
  const values = await getSheetValues(sheetTitle);
  if (values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetTitle}!A1`,
      valueInputOption: 'RAW',
      requestBody: { values: [headers as unknown as string[]] },
    });
  }
}

function columnLetter(i: number): string {
  let s = '';
  let n = i;
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}
