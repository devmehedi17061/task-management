import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isAfter, isBefore, parseISO } from 'date-fns';
import { Button } from '../ui/Button';
import { FilterBar, EMPTY_FILTERS, type Filters } from './FilterBar';
import { TaskTable } from './TaskTable';
import { TaskFormModal } from './TaskFormModal';
import { TaskDetailModal } from './TaskDetailModal';
import { StatsBar } from './StatsBar';
import { QuickFilters, type QuickFilter } from './QuickFilters';
import {
  useCreateTask,
  useDeleteTask,
  useUpdateStatus,
  useUpdateTask,
} from '../../hooks/useTasks';
import { isDueThisWeek, isDueToday, isOverdue } from '../../lib/format';
import type { DropdownItem, Status, Task, TaskInput } from '../../lib/types';

interface Props {
  tasks: Task[];
  projects: DropdownItem[];
  labels: DropdownItem[];
  users: DropdownItem[];
}

export function TasksView({ tasks, projects, labels, users }: Props) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [quick, setQuick] = useState<QuickFilter>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [active, setActive] = useState<Task | null>(null);

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const updateStatus = useUpdateStatus();
  const deleteMutation = useDeleteTask();
  const saving = createMutation.isPending || updateMutation.isPending;

  const baseFiltered = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const filtered = useMemo(() => applyQuickFilter(baseFiltered, quick), [baseFiltered, quick]);

  const counts = useMemo<Record<QuickFilter, number>>(() => {
    const c: Record<QuickFilter, number> = {
      all: 0,
      overdue: 0,
      today: 0,
      thisWeek: 0,
      unassigned: 0,
      done: 0,
    };
    for (const t of baseFiltered) {
      c.all++;
      if (isOverdue(t.dueDate, t.status)) c.overdue++;
      if (isDueToday(t.dueDate) && t.status !== 'Done' && t.status !== 'Archived') c.today++;
      if (isDueThisWeek(t.dueDate) && t.status !== 'Done' && t.status !== 'Archived') c.thisWeek++;
      if (!t.assignedTo) c.unassigned++;
      if (t.status === 'Done') c.done++;
    }
    return c;
  }, [baseFiltered]);

  const openNew = () => {
    setActive(null);
    setFormOpen(true);
  };

  const openDetail = (task: Task) => {
    setActive(task);
    setDetailOpen(true);
  };

  const openEdit = (task: Task) => {
    setActive(task);
    setDetailOpen(false);
    setFormOpen(true);
  };

  const handleSubmit = (input: TaskInput) => {
    const onDone = () => setFormOpen(false);
    if (active) {
      updateMutation.mutate({ id: active.id, patch: input }, { onSuccess: onDone });
    } else {
      createMutation.mutate(input, { onSuccess: onDone });
    }
  };

  const handleDelete = (task: Task) => {
    if (window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      deleteMutation.mutate(task.id);
      setDetailOpen(false);
    }
  };

  const handleChangeStatus = (task: Task, status: Status) => {
    updateStatus.mutate({ id: task.id, status });
    setActive({ ...task, status });
  };

  return (
    <div className="flex flex-col gap-3">
      <StatsBar tasks={tasks} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <QuickFilters value={quick} onChange={setQuick} counts={counts} />
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Record
        </Button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        labels={labels}
        projects={projects}
        users={users}
      />

      <TaskTable
        tasks={filtered}
        onOpen={openDetail}
        onEdit={openEdit}
        onDelete={handleDelete}
      />

      <TaskFormModal
        open={formOpen}
        task={active}
        projects={projects}
        labels={labels}
        users={users}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <TaskDetailModal
        open={detailOpen}
        task={active}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
      />
    </div>
  );
}

function filterTasks(tasks: Task[], f: Filters): Task[] {
  const q = f.search.trim().toLowerCase();
  const start = f.startDate ? parseISO(f.startDate) : null;
  const end = f.endDate ? parseISO(f.endDate) : null;
  return tasks.filter((t) => {
    if (q && !t.title.toLowerCase().includes(q)) return false;
    if (f.priority && t.priority !== f.priority) return false;
    if (f.status && t.status !== f.status) return false;
    if (f.project && t.project !== f.project) return false;
    if (f.label && !t.labels.includes(f.label)) return false;
    if (f.assignee && t.assignedTo !== f.assignee) return false;
    if (start || end) {
      if (!t.dueDate) return false;
      const d = parseISO(t.dueDate);
      if (start && isBefore(d, start)) return false;
      if (end && isAfter(d, end)) return false;
    }
    return true;
  });
}

function applyQuickFilter(tasks: Task[], q: QuickFilter): Task[] {
  switch (q) {
    case 'overdue':
      return tasks.filter((t) => isOverdue(t.dueDate, t.status));
    case 'today':
      return tasks.filter(
        (t) => isDueToday(t.dueDate) && t.status !== 'Done' && t.status !== 'Archived',
      );
    case 'thisWeek':
      return tasks.filter(
        (t) => isDueThisWeek(t.dueDate) && t.status !== 'Done' && t.status !== 'Archived',
      );
    case 'unassigned':
      return tasks.filter((t) => !t.assignedTo);
    case 'done':
      return tasks.filter((t) => t.status === 'Done');
    case 'all':
    default:
      return tasks;
  }
}
