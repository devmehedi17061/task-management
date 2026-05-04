import {
  AlignLeft,
  ArrowRight,
  Calendar,
  CalendarClock,
  ExternalLink,
  Flag,
  Folder,
  Pencil,
  Tag,
  Trash2,
  UserCheck,
  UserPlus,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PriorityBadge } from '../ui/Badge';
import { LabelPill, StatusPill } from '../ui/Pill';
import { DatePill } from '../ui/DatePill';
import { Avatar } from '../ui/Avatar';
import { Select } from '../ui/Select';
import { STATUSES, type Status, type Task } from '../../lib/types';
import { formatDateTime, relativeDue } from '../../lib/format';

interface Props {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onChangeStatus: (task: Task, status: Status) => void;
}

export function TaskDetailModal({
  open,
  task,
  onClose,
  onEdit,
  onDelete,
  onChangeStatus,
}: Props) {
  if (!task) {
    return (
      <Modal open={open} onClose={onClose} title="Task" width="lg">
        <div className="py-4 text-sm text-slate-500">No task selected.</div>
      </Modal>
    );
  }
  const due = task.dueDate ? relativeDue(task.dueDate) : '';
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task.title || 'Task'}
      width="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="danger" onClick={() => onDelete(task)}>
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
          <Button onClick={() => onEdit(task)}>
            <Pencil className="h-4 w-4" /> Edit task
          </Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        <PriorityBadge priority={task.priority} />
        <StatusPill status={task.status} />
        {task.project && (
          <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs text-slate-600">
            <Folder className="h-3 w-3 text-amber-500" />
            {task.project}
          </span>
        )}
        <div className="ml-auto inline-flex items-center gap-2">
          <span className="text-xs text-slate-500">Move to</span>
          <Select
            value={task.status}
            onChange={(v) => v && onChangeStatus(task, v as Status)}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
            clearable={false}
            buttonClassName="py-1 text-xs"
            className="w-[140px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-4 text-sm">
        {task.description && (
          <Row className="col-span-2" icon={AlignLeft} label="Description">
            <p className="whitespace-pre-wrap text-slate-700">{task.description}</p>
          </Row>
        )}

        {task.link && (
          <Row className="col-span-2" icon={ExternalLink} label="Link">
            <a
              href={task.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 break-all text-blue-600 hover:underline"
            >
              {task.link} <ExternalLink className="h-3 w-3" />
            </a>
          </Row>
        )}

        <Row icon={UserCheck} label="Assigned to">
          {task.assignedTo ? (
            <div className="inline-flex items-center gap-2">
              <Avatar name={task.assignedTo} size="sm" />
              <span className="text-slate-700">{task.assignedTo}</span>
            </div>
          ) : (
            <span className="text-slate-400">Unassigned</span>
          )}
        </Row>

        <Row icon={UserPlus} label="Assigned by">
          {task.assignedBy ? (
            <div className="inline-flex items-center gap-2">
              <Avatar name={task.assignedBy} size="sm" />
              <span className="text-slate-700">{task.assignedBy}</span>
            </div>
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </Row>

        <Row icon={Calendar} label="Due date">
          {task.dueDate ? (
            <div className="inline-flex items-center gap-2">
              <DatePill value={task.dueDate} status={task.status} />
              {due && <span className="text-xs text-slate-500">{due}</span>}
            </div>
          ) : (
            <span className="text-slate-400">No due date</span>
          )}
        </Row>

        <Row icon={CalendarClock} label="Reminder">
          {task.reminderDate ? (
            <DatePill value={task.reminderDate} variant="reminder" />
          ) : (
            <span className="text-slate-400">No reminder</span>
          )}
        </Row>

        <Row icon={Flag} label="Priority">
          <PriorityBadge priority={task.priority} />
        </Row>

        <Row icon={ArrowRight} label="Status">
          <StatusPill status={task.status} />
        </Row>

        {task.labels.length > 0 && (
          <Row className="col-span-2" icon={Tag} label="Labels">
            <div className="flex flex-wrap gap-1">
              {task.labels.map((l) => (
                <LabelPill key={l} label={l} />
              ))}
            </div>
          </Row>
        )}
      </div>

      <div className="mt-5 border-t border-slate-100 pt-3 text-xs text-slate-400">
        {task.createdAt && <span>Created {formatDateTime(task.createdAt)}</span>}
        {task.updatedAt && task.updatedAt !== task.createdAt && (
          <span> · Updated {formatDateTime(task.updatedAt)}</span>
        )}
      </div>
    </Modal>
  );
}

function Row({
  icon: Icon,
  label,
  children,
  className,
}: {
  icon: typeof Calendar;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500">
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {label}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}
