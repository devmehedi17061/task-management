import { getRowsAsObjects } from './sheets.js';

function fiveRandomDigits(): string {
  return String(Math.floor(10000 + Math.random() * 90000));
}

/**
 * Generate a unique ID with given prefix that does not already exist in
 * sheetTitle's idColumn. Tries up to 20 times then throws.
 */
export async function generateUniqueId(
  sheetTitle: string,
  idColumn: string,
  prefix: string,
): Promise<string> {
  const { rows } = await getRowsAsObjects(sheetTitle);
  const existing = new Set(rows.map((r) => String(r[idColumn])));
  for (let i = 0; i < 20; i++) {
    const candidate = `${prefix}${fiveRandomDigits()}`;
    if (!existing.has(candidate)) return candidate;
  }
  throw new Error(`Could not generate a unique ID with prefix ${prefix}`);
}
