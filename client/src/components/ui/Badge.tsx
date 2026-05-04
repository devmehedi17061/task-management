import clsx from 'clsx';
import type { Priority } from '../../lib/types';
import { PRIORITY_COLORS } from '../../lib/colors';

interface Props {
  priority: Priority;
}

export function PriorityBadge({ priority }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-medium',
        PRIORITY_COLORS[priority],
      )}
    >
      {priority}
    </span>
  );
}
