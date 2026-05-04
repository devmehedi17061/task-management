import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import clsx from 'clsx';
import { Fragment } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  clearable?: boolean;
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  className,
  buttonClassName,
  clearable = true,
}: Props) {
  const current = options.find((o) => o.value === value);
  return (
    <div className={clsx('relative', className)}>
      <Listbox value={value} onChange={onChange}>
        <Listbox.Button
          className={clsx(
            'relative w-full cursor-default rounded-md border border-slate-200 bg-white py-1.5 pl-3 pr-9 text-left text-sm shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            !current && 'text-slate-400',
            buttonClassName,
          )}
        >
          <span className="block truncate">{current?.label ?? placeholder}</span>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-30 mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white py-1 text-sm shadow-lg focus:outline-none scrollbar-thin">
            {clearable && (
              <Listbox.Option value="" as={Fragment}>
                {({ active }) => (
                  <li
                    className={clsx(
                      'relative cursor-default select-none px-3 py-1.5 text-slate-500',
                      active && 'bg-slate-50',
                    )}
                  >
                    Clear selection
                  </li>
                )}
              </Listbox.Option>
            )}
            {options.map((opt) => (
              <Listbox.Option key={opt.value} value={opt.value} as={Fragment}>
                {({ active, selected }) => (
                  <li
                    className={clsx(
                      'relative cursor-default select-none px-3 py-1.5',
                      active && 'bg-blue-50 text-blue-700',
                    )}
                  >
                    <span className={clsx('block truncate pr-6', selected && 'font-medium')}>
                      {opt.label}
                    </span>
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
