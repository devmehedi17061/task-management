import clsx from 'clsx';

export type QuickFilter = 'all' | 'overdue' | 'today' | 'thisWeek' | 'unassigned' | 'done';

interface Props {
  value: QuickFilter;
  onChange: (v: QuickFilter) => void;
  counts: Record<QuickFilter, number>;
}

const ITEMS: { key: QuickFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'today', label: 'Due today' },
  { key: 'thisWeek', label: 'This week' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'done', label: 'Done' },
];

export function QuickFilters({ value, onChange, counts }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ITEMS.map(({ key, label }) => {
        const active = key === value;
        const count = counts[key];
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={clsx(
              'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition',
              active
                ? 'border-blue-500 bg-blue-500 text-white shadow-sm'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            )}
          >
            {label}
            <span
              className={clsx(
                'rounded-full px-1.5 text-[10px]',
                active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600',
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
