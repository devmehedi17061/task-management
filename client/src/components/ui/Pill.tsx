import clsx from 'clsx';
import type { Status } from '../../lib/types';
import { STATUS_COLORS, labelColor } from '../../lib/colors';

export function StatusPill({ status }: { status: Status }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        STATUS_COLORS[status],
      )}
    >
      {status}
    </span>
  );
}

export function LabelPill({ label }: { label: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium',
        labelColor(label),
      )}
    >
      {label}
    </span>
  );
}
