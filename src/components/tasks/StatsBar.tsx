import { AlertTriangle, CheckCircle2, Clock, ListTodo } from 'lucide-react';
import { useMemo } from 'react';
import type { Task } from '../../lib/types';
import { isDueToday, isOverdue } from '../../lib/format';

interface Props {
  tasks: Task[];
}

export function StatsBar({ tasks }: Props) {
  const stats = useMemo(() => {
    let total = 0;
    let overdue = 0;
    let today = 0;
    let done = 0;
    for (const t of tasks) {
      if (t.status === 'Archived') continue;
      total += 1;
      if (t.status === 'Done') done += 1;
      else {
        if (isOverdue(t.dueDate, t.status)) overdue += 1;
        if (isDueToday(t.dueDate)) today += 1;
      }
    }
    return { total, overdue, today, done };
  }, [tasks]);

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Stat
        icon={<ListTodo className="h-4 w-4" />}
        label="Active tasks"
        value={stats.total}
        color="bg-blue-500"
      />
      <Stat
        icon={<AlertTriangle className="h-4 w-4" />}
        label="Overdue"
        value={stats.overdue}
        color="bg-rose-500"
      />
      <Stat
        icon={<Clock className="h-4 w-4" />}
        label="Due today"
        value={stats.today}
        color="bg-amber-500"
      />
      <Stat
        icon={<CheckCircle2 className="h-4 w-4" />}
        label="Done"
        value={stats.done}
        color="bg-emerald-500"
      />
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-card">
      <div className={`flex h-9 w-9 items-center justify-center rounded-md text-white ${color}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-medium text-slate-500">{label}</div>
        <div className="text-xl font-semibold text-slate-800">{value}</div>
      </div>
    </div>
  );
}
