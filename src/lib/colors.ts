import type { Priority, Status } from './types';

export const PRIORITY_COLORS: Record<Priority, string> = {
  High: 'bg-rose-50 text-rose-600 border-rose-200',
  Medium: 'bg-amber-50 text-amber-600 border-amber-200',
  Low: 'bg-emerald-50 text-emerald-600 border-emerald-200',
};

export const STATUS_COLORS: Record<Status, string> = {
  'To Do': 'bg-sky-50 text-sky-700 border-sky-200',
  'In Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Archived: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const KANBAN_HEADER: Record<Status, string> = {
  'To Do': 'bg-blue-500',
  'In Progress': 'bg-amber-500',
  Done: 'bg-emerald-500',
  Archived: 'bg-slate-500',
};

export const KANBAN_BORDER: Record<Status, string> = {
  'To Do': 'border-blue-500',
  'In Progress': 'border-amber-500',
  Done: 'border-emerald-500',
  Archived: 'border-slate-500',
};

export const LABEL_PALETTE = [
  'bg-pink-50 text-pink-600 border-pink-200',
  'bg-violet-50 text-violet-600 border-violet-200',
  'bg-indigo-50 text-indigo-600 border-indigo-200',
  'bg-cyan-50 text-cyan-600 border-cyan-200',
  'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-200',
  'bg-teal-50 text-teal-600 border-teal-200',
];

export function labelColor(label: string): string {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return LABEL_PALETTE[h % LABEL_PALETTE.length];
}
