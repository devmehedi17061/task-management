import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import clsx from 'clsx';
import { Archive, Check, Clock, Plus, RotateCw } from 'lucide-react';
import type { Status, Task } from '../../lib/types';
import { KANBAN_BORDER, KANBAN_HEADER } from '../../lib/colors';
import { KanbanCard } from './KanbanCard';

interface Props {
  status: Status;
  tasks: Task[];
  onAdd: () => void;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const ICONS: Record<Status, typeof Clock> = {
  'To Do': Clock,
  'In Progress': RotateCw,
  Done: Check,
  Archived: Archive,
};

export function KanbanColumn({ status, tasks, onAdd, onOpen, onEdit, onDelete }: Props) {
  const Icon = ICONS[status];
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  return (
    <div
      className={clsx(
        'flex w-full min-w-[280px] flex-col rounded-lg border-t-4 bg-slate-50/60 shadow-card',
        KANBAN_BORDER[status],
      )}
    >
      <div
        className={clsx(
          'flex items-center gap-2 rounded-t-md px-4 py-3 text-white',
          KANBAN_HEADER[status],
        )}
      >
        <Icon className="h-4 w-4" />
        <h3 className="text-sm font-semibold">{status}</h3>
        <span className="ml-auto rounded-full bg-white/25 px-2 py-0.5 text-xs">{tasks.length}</span>
        <button
          onClick={onAdd}
          className="ml-1 rounded p-1 text-white/80 hover:bg-white/20 hover:text-white"
          aria-label={`Add task to ${status}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={clsx(
          'flex flex-1 flex-col gap-3 p-3 transition',
          isOver && 'bg-blue-50/60',
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((t) => (
            <KanbanCard
              key={t.id}
              task={t}
              onOpen={onOpen}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
