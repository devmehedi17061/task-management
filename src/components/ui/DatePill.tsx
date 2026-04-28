import clsx from 'clsx';
import { Calendar, Clock } from 'lucide-react';
import { formatDate, formatDateTime, isOverdue } from '../../lib/format';
import type { Status } from '../../lib/types';

interface Props {
  value: string;
  variant?: 'due' | 'reminder';
  status?: Status;
}

export function DatePill({ value, variant = 'due', status }: Props) {
  if (!value) return null;
  const isReminder = variant === 'reminder';
  const Icon = isReminder ? Clock : Calendar;
  const display = isReminder ? formatDateTime(value) : formatDate(value);
  const overdue = !isReminder && isOverdue(value, status);
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium',
        overdue
          ? 'bg-rose-50 text-rose-700 border-rose-200'
          : isReminder
            ? 'bg-teal-50 text-teal-700 border-teal-200'
            : 'bg-cyan-50 text-cyan-700 border-cyan-200',
      )}
    >
      <Icon className="h-3 w-3" />
      {display}
    </span>
  );
}
