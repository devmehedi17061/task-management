import {
  AlignLeft,
  ArrowDown,
  ArrowUp,
  Bell,
  Calendar,
  ExternalLink,
  Flag,
  Folder,
  Link as LinkIcon,
  ListChecks,
  Pencil,
  Tag,
  Trash2,
  Type,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import type { Task } from '../../lib/types';
import { PRIORITIES } from '../../lib/types';
import { PriorityBadge } from '../ui/Badge';
import { StatusPill, LabelPill } from '../ui/Pill';
import { DatePill } from '../ui/DatePill';
import { Avatar } from '../ui/Avatar';

type SortKey = 'title' | 'priority' | 'status' | 'dueDate' | 'project' | 'assignedTo';
type SortDir = 'asc' | 'desc';

interface Props {
  tasks: Task[];
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const COLUMNS = [
  { key: 'title' as const, label: 'Title', icon: Type, w: 'w-44', sortable: true },
  { key: 'description' as const, label: 'Description', icon: AlignLeft, w: 'w-56', sortable: false },
  { key: 'link' as const, label: 'Link', icon: LinkIcon, w: 'w-44', sortable: false },
  { key: 'priority' as const, label: 'Priority', icon: Flag, w: 'w-24', sortable: true },
  { key: 'status' as const, label: 'Status', icon: ListChecks, w: 'w-28', sortable: true },
  { key: 'dueDate' as const, label: 'Due Date', icon: Calendar, w: 'w-32', sortable: true },
  { key: 'labels' as const, label: 'Labels', icon: Tag, w: 'w-40', sortable: false },
  { key: 'project' as const, label: 'Project', icon: Folder, w: 'w-36', sortable: true },
  { key: 'reminderDate' as const, label: 'Reminder', icon: Bell, w: 'w-40', sortable: false },
  { key: 'assignedTo' as const, label: 'Assigned To', icon: UserCheck, w: 'w-36', sortable: true },
  { key: 'assignedBy' as const, label: 'Assigned By', icon: UserPlus, w: 'w-36', sortable: false },
];

export function TaskTable({ tasks, onOpen, onEdit, onDelete }: Props) {
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const sorted = useMemo(() => {
    if (!sortKey) return tasks;
    const copy = [...tasks];
    const dir = sortDir === 'asc' ? 1 : -1;
    copy.sort((a, b) => {
      const av = compareValue(a, sortKey);
      const bv = compareValue(b, sortKey);
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
      return 0;
    });
    return copy;
  }, [tasks, sortKey, sortDir]);

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  if (tasks.length === 0) {
    return (
      <div className="rounded-lg bg-white p-10 text-center text-sm text-slate-500 shadow-card">
        No tasks match the current filters.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-card scrollbar-thin">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left text-slate-500">
            {COLUMNS.map(({ key, label, icon: Icon, w, sortable }) => {
              const active = sortable && sortKey === key;
              return (
                <th
                  key={key}
                  className={clsx(`${w} px-4 py-3 font-medium`, sortable && 'cursor-pointer select-none')}
                  onClick={sortable ? () => onSort(key as SortKey) : undefined}
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Icon className="h-4 w-4 text-amber-500" />
                    {label}
                    {active && (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)}
                  </span>
                </th>
              );
            })}
            <th className="w-20 px-4 py-3 text-right font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {sorted.map((t) => (
            <tr
              key={t.id}
              className="cursor-pointer hover:bg-slate-50/60"
              onClick={() => onOpen(t)}
            >
              <td className="px-4 py-3 align-top font-medium text-slate-800">{t.title}</td>
              <td className="px-4 py-3 align-top text-slate-600">
                <span className="line-clamp-2">{t.description}</span>
              </td>
              <td className="px-4 py-3 align-top">
                {t.link && (
                  <a
                    href={t.link}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <span className="truncate max-w-[160px]">{t.link}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                <PriorityBadge priority={t.priority} />
              </td>
              <td className="px-4 py-3 align-top">
                <StatusPill status={t.status} />
              </td>
              <td className="px-4 py-3 align-top">
                <DatePill value={t.dueDate} status={t.status} />
              </td>
              <td className="px-4 py-3 align-top">
                <div className="flex flex-wrap gap-1">
                  {t.labels.map((l) => (
                    <LabelPill key={l} label={l} />
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 align-top text-slate-700">{t.project}</td>
              <td className="px-4 py-3 align-top">
                <DatePill value={t.reminderDate} variant="reminder" />
              </td>
              <td className="px-4 py-3 align-top">
                {t.assignedTo ? (
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={t.assignedTo} size="sm" />
                    <span className="text-slate-700">{t.assignedTo}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                {t.assignedBy ? (
                  <span className="inline-flex items-center gap-2">
                    <Avatar name={t.assignedBy} size="sm" />
                    <span className="text-slate-700">{t.assignedBy}</span>
                  </span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 align-top">
                <div
                  className="flex items-center justify-end gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onEdit(t)}
                    className="rounded p-1.5 text-fuchsia-500 hover:bg-fuchsia-50"
                    aria-label="Edit task"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(t)}
                    className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                    aria-label="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const PRIORITY_RANK: Record<string, number> = Object.fromEntries(
  PRIORITIES.map((p, i) => [p, i]),
);
const STATUS_RANK: Record<string, number> = {
  'To Do': 0,
  'In Progress': 1,
  Done: 2,
  Archived: 3,
};

function compareValue(t: Task, key: SortKey): number | string {
  switch (key) {
    case 'priority':
      return PRIORITY_RANK[t.priority] ?? 99;
    case 'status':
      return STATUS_RANK[t.status] ?? 99;
    case 'dueDate':
      return t.dueDate ? Date.parse(t.dueDate) || 0 : Number.POSITIVE_INFINITY;
    case 'project':
      return t.project.toLowerCase();
    case 'assignedTo':
      return t.assignedTo.toLowerCase();
    case 'title':
    default:
      return t.title.toLowerCase();
  }
}
