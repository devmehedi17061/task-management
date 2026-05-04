import type { Task, TaskInput, Priority, Status } from './types.js';

function toIso(v: unknown): string {
  if (!v) return '';
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

/**
 * Convert a raw sheet row (header-keyed) into a normalized Task. `labels` is
 * stored in the sheet as a pipe-delimited string for spreadsheet readability,
 * and split back into an array here.
 */
export function rowToTask(row: Record<string, unknown>): Task {
  const labelsRaw = String(row.labels ?? '');
  const labels = labelsRaw
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: String(row.id ?? ''),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    link: String(row.link ?? ''),
    priority: (String(row.priority ?? 'Medium') || 'Medium') as Priority,
    status: (String(row.status ?? 'To Do') || 'To Do') as Status,
    dueDate: toIso(row.dueDate),
    labels,
    project: String(row.project ?? ''),
    reminderDate: toIso(row.reminderDate),
    assignedTo: String(row.assignedTo ?? ''),
    assignedBy: String(row.assignedBy ?? ''),
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

/**
 * Convert a Task into a sheet-row record. `labels` becomes pipe-delimited.
 */
export function taskToRow(task: Task): Record<string, unknown> {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    link: task.link,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate,
    labels: task.labels.join('|'),
    project: task.project,
    reminderDate: task.reminderDate,
    assignedTo: task.assignedTo,
    assignedBy: task.assignedBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

/**
 * Build a brand-new Task from a TaskInput (used by createTask). Caller
 * supplies `id` and timestamps.
 */
export function buildTask(input: TaskInput, id: string, now: string): Task {
  return {
    id,
    title: input.title ?? '',
    description: input.description ?? '',
    link: input.link ?? '',
    priority: input.priority ?? 'Medium',
    status: input.status ?? 'To Do',
    dueDate: input.dueDate ?? '',
    labels: input.labels ?? [],
    project: input.project ?? '',
    reminderDate: input.reminderDate ?? '',
    assignedTo: input.assignedTo ?? '',
    assignedBy: input.assignedBy ?? '',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Apply a patch to an existing Task (used by updateTask). Always bumps
 * `updatedAt`. `labels` replaces, doesn't merge.
 */
export function applyPatch(task: Task, patch: Partial<TaskInput>, now: string): Task {
  return {
    ...task,
    title: patch.title ?? task.title,
    description: patch.description ?? task.description,
    link: patch.link ?? task.link,
    priority: patch.priority ?? task.priority,
    status: patch.status ?? task.status,
    dueDate: patch.dueDate ?? task.dueDate,
    labels: patch.labels ?? task.labels,
    project: patch.project ?? task.project,
    reminderDate: patch.reminderDate ?? task.reminderDate,
    assignedTo: patch.assignedTo ?? task.assignedTo,
    assignedBy: patch.assignedBy ?? task.assignedBy,
    updatedAt: now,
  };
}
