import { Router, type Request, type Response, type NextFunction } from 'express';
import { ensureSheet, getRowsAsObjects } from '../sheets.js';
import { rowToTask } from '../normalize.js';
import {
  DROPDOWN_HEADERS,
  PRIORITIES,
  SHEETS,
  STATUSES,
  TASK_HEADERS,
  type BootstrapResponse,
  type DropdownItem,
} from '../types.js';

const router = Router();

router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    await Promise.all([
      ensureSheet(SHEETS.tasks, TASK_HEADERS),
      ensureSheet(SHEETS.projects, DROPDOWN_HEADERS),
      ensureSheet(SHEETS.labels, DROPDOWN_HEADERS),
      ensureSheet(SHEETS.users, DROPDOWN_HEADERS),
    ]);

    const [tasksSheet, projectsSheet, labelsSheet, usersSheet] = await Promise.all([
      getRowsAsObjects(SHEETS.tasks),
      getRowsAsObjects(SHEETS.projects),
      getRowsAsObjects(SHEETS.labels),
      getRowsAsObjects(SHEETS.users),
    ]);

    const tasks = tasksSheet.rows
      .filter((r) => r.id)
      .map((r) => rowToTask(r));

    const toDropdown = (rows: typeof projectsSheet.rows): DropdownItem[] =>
      rows
        .filter((r) => r.id)
        .map((r) => ({ id: String(r.id), name: String(r.name ?? '') }));

    const payload: BootstrapResponse = {
      tasks,
      projects: toDropdown(projectsSheet.rows),
      labels: toDropdown(labelsSheet.rows),
      users: toDropdown(usersSheet.rows),
      statuses: STATUSES,
      priorities: PRIORITIES,
    };

    res.json(payload);
  } catch (e) {
    next(e);
  }
});

export default router;
