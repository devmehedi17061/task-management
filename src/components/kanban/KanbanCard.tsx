import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import clsx from 'clsx';
import { ExternalLink, Folder, Pencil, Trash2 } from 'lucide-react';
import type { Task } from '../../lib/types';
import { LabelPill } from '../ui/Pill';
import { DatePill } from '../ui/DatePill';
import { Avatar } from '../ui/Avatar';
import { PriorityBadge } from '../ui/Badge';
import { isOverdue } from '../../lib/format';

interface Props {
  task: Task;
  onOpen: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function KanbanCard({ task, onOpen, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
  };

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'rounded-md border bg-white p-3 shadow-card hover:shadow-md',
        overdue ? 'border-rose-200' : 'border-slate-100',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => {
          // dnd-kit's distance threshold guarantees no click after drag.
          if (e.defaultPrevented) return;
          onOpen(task);
        }}
        className="cursor-pointer active:cursor-grabbing"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
            <Folder className="h-3.5 w-3.5 text-amber-500" />
            <span className="line-clamp-1">{task.title}</span>
          </div>
          {task.project && (
            <span className="shrink-0 text-xs text-slate-400">#{task.project}</span>
          )}
        </div>

        {task.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-slate-500">{task.description}</p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={task.priority} />
          <DatePill value={task.dueDate} status={task.status} />
          {task.labels.slice(0, 3).map((l) => (
            <LabelPill key={l} label={l} />
          ))}
          {task.labels.length > 3 && (
            <span className="text-[10px] text-slate-400">+{task.labels.length - 3}</span>
          )}
          {task.link && (
            <span
              role="img"
              aria-label="Has link"
              className="inline-flex items-center text-slate-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {task.assignedTo && <Avatar name={task.assignedTo} size="sm" title={`Assigned to ${task.assignedTo}`} />}
          {task.assignedBy && task.assignedBy !== task.assignedTo && (
            <Avatar
              name={task.assignedBy}
              size="xs"
              className="-ml-2"
              title={`Assigned by ${task.assignedBy}`}
            />
          )}
          {!task.assignedTo && !task.assignedBy && (
            <span className="text-[11px] text-slate-400">Unassigned</span>
          )}
        </div>
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1 text-fuchsia-500 hover:bg-fuchsia-50"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded p-1 text-rose-500 hover:bg-rose-50"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
