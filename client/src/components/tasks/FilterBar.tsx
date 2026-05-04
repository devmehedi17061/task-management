import { Search, X } from 'lucide-react';
import { Select } from '../ui/Select';
import type { DropdownItem, Priority, Status } from '../../lib/types';
import { PRIORITIES, STATUSES } from '../../lib/types';

export interface Filters {
  search: string;
  priority: '' | Priority;
  status: '' | Status;
  startDate: string;
  endDate: string;
  label: string;
  project: string;
  assignee: string;
}

export const EMPTY_FILTERS: Filters = {
  search: '',
  priority: '',
  status: '',
  startDate: '',
  endDate: '',
  label: '',
  project: '',
  assignee: '',
};

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
  labels: DropdownItem[];
  projects: DropdownItem[];
  users: DropdownItem[];
}

export function FilterBar({ filters, onChange, labels, projects, users }: Props) {
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    onChange({ ...filters, [key]: value });

  const isFiltered = Object.values(filters).some((v) => v !== '');

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-white p-3 shadow-card">
      <div className="relative min-w-[200px] flex-1">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          placeholder="Search by title"
          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <Select
        className="w-[160px]"
        value={filters.priority}
        onChange={(v) => update('priority', (v as Priority) || '')}
        options={PRIORITIES.map((p) => ({ value: p, label: p }))}
        placeholder="Filter by priority"
      />

      <Select
        className="w-[160px]"
        value={filters.status}
        onChange={(v) => update('status', (v as Status) || '')}
        options={STATUSES.map((s) => ({ value: s, label: s }))}
        placeholder="Filter by status"
      />

      <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm shadow-sm">
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => update('startDate', e.target.value)}
          className="border-0 bg-transparent text-sm focus:outline-none"
          aria-label="Start date"
        />
        <span className="text-slate-400">→</span>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => update('endDate', e.target.value)}
          className="border-0 bg-transparent text-sm focus:outline-none"
          aria-label="End date"
        />
      </div>

      <Select
        className="w-[160px]"
        value={filters.label}
        onChange={(v) => update('label', v)}
        options={labels.map((l) => ({ value: l.name, label: l.name }))}
        placeholder="Filter by label"
      />

      <Select
        className="w-[160px]"
        value={filters.project}
        onChange={(v) => update('project', v)}
        options={projects.map((p) => ({ value: p.name, label: p.name }))}
        placeholder="Filter by project"
      />

      <Select
        className="w-[160px]"
        value={filters.assignee}
        onChange={(v) => update('assignee', v)}
        options={users.map((u) => ({ value: u.name, label: u.name }))}
        placeholder="Filter by assignee"
      />

      {isFiltered && (
        <button
          onClick={() => onChange(EMPTY_FILTERS)}
          className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
        >
          <X className="h-3.5 w-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
