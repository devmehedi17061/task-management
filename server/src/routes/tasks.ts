import { Router, type Request, type Response, type NextFunction } from 'express';
import {
  appendRow,
  deleteRowById,
  getRowsAsObjects,
  updateRowById,
} from '../sheets.js';
import { generateUniqueId } from '../idGenerator.js';
import { applyPatch, buildTask, rowToTask, taskToRow } from '../normalize.js';
import { SHEETS, type Status, type TaskInput } from '../types.js';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input = (req.body || {}) as TaskInput;
    if (!input.title) {
      return res.status(400).json({ error: 'title is required' });
    }
    const id = await generateUniqueId(SHEETS.tasks, 'id', 'T');
    const task = buildTask(input, id, new Date().toISOString());
    await appendRow(SHEETS.tasks, taskToRow(task));
    res.json({ task });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const patch = (req.body || {}) as Partial<TaskInput>;
    const { rows } = await getRowsAsObjects(SHEETS.tasks);
    const target = rows.find((r) => String(r.id) === String(id));
    if (!target) return res.status(404).json({ error: `Task not found: ${id}` });

    const current = rowToTask(target);
    const updated = applyPatch(current, patch, new Date().toISOString());
    await updateRowById(SHEETS.tasks, 'id', id, taskToRow(updated));
    res.json({ task: updated });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const status = (req.body || {}).status as Status | undefined;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const updatedRow = await updateRowById(SHEETS.tasks, 'id', id, {
      status,
      updatedAt: new Date().toISOString(),
    });
    if (updatedRow == null) return res.status(404).json({ error: `Task not found: ${id}` });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

// Idempotent: returns ok even if the row is already gone.
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteRowById(SHEETS.tasks, 'id', req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
