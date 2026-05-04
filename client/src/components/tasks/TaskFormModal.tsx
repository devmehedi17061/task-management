import { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { MultiSelect } from '../ui/MultiSelect';
import {
  PRIORITIES,
  STATUSES,
  type DropdownItem,
  type Priority,
  type Status,
  type Task,
  type TaskInput,
} from '../../lib/types';
import {
  fromDateInputValue,
  fromDateTimeInputValue,
  toDateInputValue,
  toDateTimeInputValue,
} from '../../lib/format';

interface Props {
  open: boolean;
  task?: Task | null;
  defaultStatus?: Status;
  projects: DropdownItem[];
  labels: DropdownItem[];
  users: DropdownItem[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: TaskInput) => void;
}

interface FormState {
  title: string;
  description: string;
  link: string;
  priority: Priority;
  status: Status;
  dueDate: string;
  labels: string[];
  project: string;
  reminderDate: string;
  assignedTo: string;
  assignedBy: string;
}

function buildInitial(task?: Task | null, defaultStatus: Status = 'To Do'): FormState {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    link: task?.link ?? '',
    priority: task?.priority ?? 'Medium',
    status: task?.status ?? defaultStatus,
    dueDate: toDateInputValue(task?.dueDate ?? ''),
    labels: task?.labels ?? [],
    project: task?.project ?? '',
    reminderDate: toDateTimeInputValue(task?.reminderDate ?? ''),
    assignedTo: task?.assignedTo ?? '',
    assignedBy: task?.assignedBy ?? '',
  };
}

export function TaskFormModal({
  open,
  task,
  defaultStatus,
  projects,
  labels,
  users,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<FormState>(() => buildInitial(task, defaultStatus));

  useEffect(() => {
    if (open) setForm(buildInitial(task, defaultStatus));
  }, [open, task, defaultStatus]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = () => {
    onSubmit({
      title: form.title.trim(),
      description: form.description,
      link: form.link,
      priority: form.priority,
      status: form.status,
      dueDate: fromDateInputValue(form.dueDate),
      labels: form.labels,
      project: form.project,
      reminderDate: fromDateTimeInputValue(form.reminderDate),
      assignedTo: form.assignedTo,
      assignedBy: form.assignedBy,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={task ? 'Edit Task' : 'New Task'}
      width="xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !form.title.trim()}>
            {saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Field label="Title" required className="col-span-2">
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            className={inputClass}
            placeholder="Task title"
            autoFocus
          />
        </Field>

        <Field label="Description" className="col-span-2">
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={`${inputClass} min-h-[72px]`}
            placeholder="Add more detail…"
          />
        </Field>

        <Field label="Link" className="col-span-2">
          <input
            value={form.link}
            onChange={(e) => set('link', e.target.value)}
            className={inputClass}
            placeholder="https://"
          />
        </Field>

        <Field label="Priority">
          <Select
            value={form.priority}
            onChange={(v) => set('priority', (v as Priority) || 'Medium')}
            options={PRIORITIES.map((p) => ({ value: p, label: p }))}
            clearable={false}
          />
        </Field>

        <Field label="Status">
          <Select
            value={form.status}
            onChange={(v) => set('status', (v as Status) || 'To Do')}
            options={STATUSES.map((s) => ({ value: s, label: s }))}
            clearable={false}
          />
        </Field>

        <Field label="Due Date">
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => set('dueDate', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Reminder Date">
          <input
            type="datetime-local"
            value={form.reminderDate}
            onChange={(e) => set('reminderDate', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Project">
          <Select
            value={form.project}
            onChange={(v) => set('project', v)}
            options={projects.map((p) => ({ value: p.name, label: p.name }))}
            placeholder="Select project"
          />
        </Field>

        <Field label="Labels">
          <MultiSelect
            values={form.labels}
            onChange={(v) => set('labels', v)}
            options={labels.map((l) => l.name)}
            placeholder="Select labels"
          />
        </Field>

        <Field label="Assigned to">
          <Select
            value={form.assignedTo}
            onChange={(v) => set('assignedTo', v)}
            options={users.map((u) => ({ value: u.name, label: u.name }))}
            placeholder="Select assignee"
          />
        </Field>

        <Field label="Assigned by">
          <Select
            value={form.assignedBy}
            onChange={(v) => set('assignedBy', v)}
            options={users.map((u) => ({ value: u.name, label: u.name }))}
            placeholder="Select assigner"
          />
        </Field>
      </div>
    </Modal>
  );
}

const inputClass =
  'w-full rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500';

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`flex flex-col gap-1 ${className ?? ''}`}>
      <span className="text-xs font-medium text-slate-600">
        {label}
        {required ? <span className="text-rose-500">&nbsp;*</span> : null}
      </span>
      {children}
    </label>
  );
}
