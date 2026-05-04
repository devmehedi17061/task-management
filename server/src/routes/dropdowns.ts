import { Router, type Request, type Response, type NextFunction } from 'express';
import { appendRow, deleteRowById } from '../sheets.js';
import { generateUniqueId } from '../idGenerator.js';
import { SHEETS, type DropdownKind } from '../types.js';

const router = Router();

function sheetForKind(kind: string): string | null {
  if (kind === 'projects') return SHEETS.projects;
  if (kind === 'labels') return SHEETS.labels;
  if (kind === 'users') return SHEETS.users;
  return null;
}

function prefixForKind(kind: string): string | null {
  if (kind === 'projects') return 'PR';
  if (kind === 'labels') return 'L';
  if (kind === 'users') return 'U';
  return null;
}

router.post('/:kind', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sheet = sheetForKind(req.params.kind);
    const prefix = prefixForKind(req.params.kind);
    if (!sheet || !prefix) return res.status(400).json({ error: `Unknown dropdown kind: ${req.params.kind}` });
    const name = ((req.body || {}).name as string | undefined)?.trim();
    if (!name) return res.status(400).json({ error: 'name is required' });
    const id = await generateUniqueId(sheet, 'id', prefix);
    await appendRow(sheet, { id, name });
    res.json({ id, name } satisfies { id: string; name: string });
  } catch (e) {
    next(e);
  }
});

// Idempotent: returns ok even if the row is already gone.
router.delete('/:kind/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sheet = sheetForKind(req.params.kind as DropdownKind);
    if (!sheet) return res.status(400).json({ error: `Unknown dropdown kind: ${req.params.kind}` });
    await deleteRowById(sheet, 'id', req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
