import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { TaskFormModal } from '../tasks/TaskFormModal';
import { TaskDetailModal } from '../tasks/TaskDetailModal';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import {
  useCreateTask,
  useDeleteTask,
  useUpdateStatus,
  useUpdateTask,
} from '../../hooks/useTasks';
import {
  STATUSES,
  type DropdownItem,
  type Status,
  type Task,
  type TaskInput,
} from '../../lib/types';

interface Props {
  tasks: Task[];
  projects: DropdownItem[];
  labels: DropdownItem[];
  users: DropdownItem[];
}

export function KanbanView({ tasks, projects, labels, users }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<Status>('To Do');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const createMutation = useCreateTask();
  const updateMutation = useUpdateTask();
  const updateStatus = useUpdateStatus();
  const deleteMutation = useDeleteTask();
  const saving = createMutation.isPending || updateMutation.isPending;

  const grouped = useMemo(() => {
    const buckets: Record<Status, Task[]> = {
      'To Do': [],
      'In Progress': [],
      Done: [],
      Archived: [],
    };
    for (const t of tasks) {
      if (buckets[t.status]) buckets[t.status].push(t);
      else buckets['To Do'].push(t);
    }
    return buckets;
  }, [tasks]);

  const activeTask = useMemo(
    () => (activeId ? tasks.find((t) => t.id === activeId) ?? null : null),
    [activeId, tasks],
  );

  const onDragStart = (e: DragStartEvent) => {
    setActiveId(String(e.active.id));
  };

  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;
    const dragged = tasks.find((t) => t.id === active.id);
    if (!dragged) return;
    const overData = over.data.current as { status?: Status; task?: Task } | undefined;
    let newStatus: Status | undefined = overData?.status ?? overData?.task?.status;
    if (!newStatus && STATUSES.includes(over.id as Status)) newStatus = over.id as Status;
    if (!newStatus || newStatus === dragged.status) return;
    updateStatus.mutate({ id: dragged.id, status: newStatus });
  };

  const openNew = (status: Status = 'To Do') => {
    setEditing(null);
    setDefaultStatus(status);
    setFormOpen(true);
  };

  const openDetail = (task: Task) => {
    setEditing(task);
    setDetailOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setDetailOpen(false);
    setFormOpen(true);
  };

  const handleSubmit = (input: TaskInput) => {
    const onDone = () => setFormOpen(false);
    if (editing) {
      updateMutation.mutate({ id: editing.id, patch: input }, { onSuccess: onDone });
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
    setEditing({ ...task, status });
  };

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Button onClick={() => openNew()} className="gap-1.5">
          <Plus className="h-4 w-4" /> New Task
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {STATUSES.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={grouped[status]}
              onAdd={() => openNew(status)}
              onOpen={openDetail}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90">
              <KanbanCard
                task={activeTask}
                onOpen={() => {}}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskFormModal
        open={formOpen}
        task={editing}
        defaultStatus={defaultStatus}
        projects={projects}
        labels={labels}
        users={users}
        saving={saving}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <TaskDetailModal
        open={detailOpen}
        task={editing}
        onClose={() => setDetailOpen(false)}
        onEdit={openEdit}
        onDelete={handleDelete}
        onChangeStatus={handleChangeStatus}
      />
    </div>
  );
}
