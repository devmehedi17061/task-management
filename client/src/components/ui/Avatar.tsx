import clsx from 'clsx';

const PALETTE = [
  'bg-rose-500',
  'bg-amber-500',
  'bg-emerald-500',
  'bg-teal-500',
  'bg-sky-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-violet-500',
  'bg-fuchsia-500',
  'bg-pink-500',
];

function colorFor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface Props {
  name: string;
  size?: 'xs' | 'sm' | 'md';
  title?: string;
  className?: string;
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  xs: 'h-5 w-5 text-[10px]',
  sm: 'h-6 w-6 text-xs',
  md: 'h-8 w-8 text-sm',
};

export function Avatar({ name, size = 'sm', title, className }: Props) {
  if (!name) {
    return (
      <span
        className={clsx(
          'inline-flex items-center justify-center rounded-full bg-slate-200 font-medium text-slate-500 ring-2 ring-white',
          SIZE[size],
          className,
        )}
        title={title ?? 'Unassigned'}
      >
        ?
      </span>
    );
  }
  return (
    <span
      className={clsx(
        'inline-flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-white',
        colorFor(name),
        SIZE[size],
        className,
      )}
      title={title ?? name}
    >
      {initialsOf(name)}
    </span>
  );
}

export function AvatarWithName({
  name,
  prefix,
  size = 'sm',
}: {
  name: string;
  prefix?: string;
  size?: Props['size'];
}) {
  if (!name) return <span className="text-xs text-slate-400">{prefix ? `${prefix} —` : '—'}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Avatar name={name} size={size} />
      <span className="text-sm text-slate-700">{name}</span>
    </span>
  );
}
