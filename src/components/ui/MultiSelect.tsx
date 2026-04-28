import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';
import { Fragment } from 'react';

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  values,
  onChange,
  options,
  placeholder = 'Select…',
  className,
}: Props) {
  const remove = (v: string) => onChange(values.filter((x) => x !== v));
  return (
    <div className={clsx('relative', className)}>
      <Listbox value={values} onChange={onChange} multiple>
        <Listbox.Button className="relative flex min-h-[34px] w-full flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-white py-1 pl-2 pr-9 text-left text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
          {values.length === 0 && (
            <span className="px-1 text-slate-400">{placeholder}</span>
          )}
          {values.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700"
            >
              {v}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(v);
                }}
                className="text-slate-400 hover:text-slate-700"
                aria-label={`Remove ${v}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none scrollbar-thin">
            {options.length === 0 && (
              <li className="px-3 py-1.5 text-slate-400">No options</li>
            )}
            {options.map((opt) => (
              <Listbox.Option key={opt} value={opt} as={Fragment}>
                {({ active, selected }) => (
                  <li
                    className={clsx(
                      'relative cursor-default select-none px-3 py-1.5 pr-7',
                      active && 'bg-blue-50 text-blue-700',
                    )}
                  >
                    <span className={clsx('block truncate', selected && 'font-medium')}>{opt}</span>
                    {selected && (
                      <Check className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-600" />
                    )}
                  </li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </Listbox>
    </div>
  );
}
