import { differenceInCalendarDays, format, isValid, parseISO, startOfDay } from 'date-fns';

export function formatDate(value: string): string {
  if (!value) return '';
  const d = parseISO(value);
  if (!isValid(d)) return value;
  return format(d, 'M/d/yyyy');
}

export function formatDateTime(value: string): string {
  if (!value) return '';
  const d = parseISO(value);
  if (!isValid(d)) return value;
  return format(d, 'M/d/yyyy, h:mm a');
}

export function toDateInputValue(value: string): string {
  if (!value) return '';
  const d = parseISO(value);
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}

export function toDateTimeInputValue(value: string): string {
  if (!value) return '';
  const d = parseISO(value);
  if (!isValid(d)) return '';
  return format(d, "yyyy-MM-dd'T'HH:mm");
}

export function fromDateInputValue(value: string): string {
  if (!value) return '';
  const d = new Date(value + 'T00:00:00');
  return isValid(d) ? d.toISOString() : '';
}

export function fromDateTimeInputValue(value: string): string {
  if (!value) return '';
  const d = new Date(value);
  return isValid(d) ? d.toISOString() : '';
}

/** > 0 days late, 0 = today, < 0 = days remaining. Returns null when no date. */
export function daysFromToday(value: string): number | null {
  if (!value) return null;
  const d = parseISO(value);
  if (!isValid(d)) return null;
  return differenceInCalendarDays(startOfDay(new Date()), startOfDay(d));
}

export function isOverdue(value: string, status?: string): boolean {
  if (status === 'Done' || status === 'Archived') return false;
  const diff = daysFromToday(value);
  return diff !== null && diff > 0;
}

export function isDueToday(value: string): boolean {
  return daysFromToday(value) === 0;
}

export function isDueThisWeek(value: string): boolean {
  const d = daysFromToday(value);
  return d !== null && d <= 0 && d >= -7;
}

export function relativeDue(value: string): string {
  const diff = daysFromToday(value);
  if (diff === null) return '';
  if (diff > 0) return `${diff}d overdue`;
  if (diff === 0) return 'Due today';
  if (diff === -1) return 'Due tomorrow';
  if (diff >= -7) return `Due in ${-diff}d`;
  return formatDate(value);
}
