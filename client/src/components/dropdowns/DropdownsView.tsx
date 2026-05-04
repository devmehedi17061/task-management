import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import clsx from 'clsx';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  useAddDropdown,
  useDeleteDropdown,
} from '../../hooks/useTasks';
import type { DropdownItem, DropdownKind } from '../../lib/types';

interface Props {
  projects: DropdownItem[];
  labels: DropdownItem[];
  users: DropdownItem[];
}

const TABS: { key: DropdownKind; label: string }[] = [
  { key: 'projects', label: 'Projects' },
  { key: 'labels', label: 'Labels' },
  { key: 'users', label: 'Users' },
];

export function DropdownsView({ projects, labels, users }: Props) {
  const [tab, setTab] = useState<DropdownKind>('projects');
  const [name, setName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<DropdownItem | null>(null);

  const addMutation = useAddDropdown();
  const deleteMutation = useDeleteDropdown();

  const items: DropdownItem[] =
    tab === 'projects' ? projects : tab === 'labels' ? labels : users;

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addMutation.mutate({ kind: tab, name: trimmed }, { onSuccess: () => setName('') });
  };

  const handleDelete = (item: DropdownItem) => {
    setPendingDelete(item);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(
      { kind: tab, id: pendingDelete.id },
      { onSettled: () => setPendingDelete(null) },
    );
  };

  const tabSingular = tab.slice(0, -1);

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg bg-white p-2 shadow-card">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={clsx(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                tab === t.key
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg bg-white p-4 shadow-card">
        <div className="flex items-center gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            placeholder={`Add new ${tab.slice(0, -1)}…`}
            className="flex-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button onClick={handleAdd} disabled={addMutation.isPending || !name.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>

        <ul className="mt-4 divide-y divide-slate-100">
          {items.length === 0 && (
            <li className="py-6 text-center text-sm text-slate-400">No items yet</li>
          )}
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between py-2.5 text-sm text-slate-700"
            >
              <span>{item.name}</span>
              <button
                onClick={() => handleDelete(item)}
                className="rounded p-1.5 text-rose-500 hover:bg-rose-50"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Remove ${tabSingular}?`}
        message={
          pendingDelete ? (
            <>
              Remove{' '}
              <span className="font-semibold text-slate-900">“{pendingDelete.name}”</span> from{' '}
              {tab}? Existing tasks that reference it will keep the value, but it won't appear in
              the picker anymore.
            </>
          ) : null
        }
        confirmLabel="Remove"
        loading={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
