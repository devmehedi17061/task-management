import clsx from 'clsx';
import { CheckSquare, KanbanSquare, ListChecks } from 'lucide-react';

export type View = 'tasks' | 'kanban' | 'dropdowns';

interface Props {
  view: View;
  onChange: (view: View) => void;
}

const NAV: { key: View; label: string; icon: typeof CheckSquare }[] = [
  { key: 'tasks', label: 'Tasks', icon: CheckSquare },
  { key: 'kanban', label: 'Kanban Board', icon: KanbanSquare },
  { key: 'dropdowns', label: 'Dropdowns', icon: ListChecks },
];

export function Sidebar({ view, onChange }: Props) {
  return (
    <aside className="flex h-full w-60 flex-col bg-sidebar text-slate-100">
      <div className="flex items-center gap-2 px-5 py-5">
        <Logo />
      </div>
      <nav className="mt-2 flex flex-col gap-1 px-3">
        {NAV.map(({ key, label, icon: Icon }) => {
          const active = key === view;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={clsx(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'bg-slate-800 text-white shadow-inner'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto px-5 py-4 text-[11px] text-slate-500">
        Connected to Google Sheets
      </div>
    </aside>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <svg viewBox="0 0 32 32" className="h-9 w-9">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="7" fill="url(#lg)" />
        <path
          d="M9 16.5l4.2 4.2L23 11"
          stroke="#fff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">TaskFlow</div>
        <div className="text-[11px] text-slate-400">Sheet-powered</div>
      </div>
    </div>
  );
}
