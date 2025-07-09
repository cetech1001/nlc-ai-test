import {Listbox, Transition} from "@headlessui/react";
import {Check, ChevronDown} from "lucide-react";
import {FC, Fragment, useCallback, useMemo} from "react";
import {FilterConfig} from "../index";

interface IProps {
  value: any;
  filter: FilterConfig;
  handleFilterChange: (key: string, value: any) => void;
}

export const SelectFilter: FC<IProps> = (props) => {
  const { filter, value, handleFilterChange } = props;

  // Normalize the current value - ensure it's always a string
  const normalizedValue = useMemo(() => {
    if (value === null || value === undefined) {
      return filter.defaultValue || '';
    }
    return String(value);
  }, [value, filter.defaultValue]);

  // Memoize the onChange handler to prevent infinite re-renders
  const handleChange = useCallback((newValue: any) => {
    console.log(`Filter ${filter.key} changing from "${normalizedValue}" to "${newValue}"`);

    // Only call handleFilterChange if the value actually changed
    if (String(newValue) !== normalizedValue) {
      handleFilterChange(filter.key, String(newValue));
    }
  }, [filter.key, normalizedValue, handleFilterChange]);

  // Find the current option label
  const currentOption = useMemo(() => {
    return filter.options?.find(opt => String(opt.value) === normalizedValue);
  }, [filter.options, normalizedValue]);

  const displayLabel = currentOption?.label || filter.placeholder || 'Select...';

  // Debug log
  console.log(`SelectFilter ${filter.key}:`, {
    originalValue: value,
    normalizedValue,
    displayLabel,
    options: filter.options?.map(o => ({ label: o.label, value: o.value, type: typeof o.value }))
  });

  return (
    <Listbox value={normalizedValue} onChange={handleChange}>
      <div className="relative">
        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]">
          <span className="block truncate">
            {displayLabel}
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDown className="h-5 w-5 text-[#A0A0A0]" />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-[#2A2A2A] border border-[#3A3A3A] py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
            <Listbox.Option
              value=""
              className={({ active }) =>
                `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                  active ? 'bg-[#3A3A3A] text-white' : 'text-white'
                }`
              }
            >
              {({ selected }) => (
                <>
                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                    All
                  </span>
                  {selected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7B21BA]">
                      <Check className="h-5 w-5" />
                    </span>
                  )}
                </>
              )}
            </Listbox.Option>
            {filter.options?.map((option, optionIdx) => (
              <Listbox.Option
                key={`${filter.key}-${option.value}-${optionIdx}`}
                value={String(option.value)} // Ensure value is string
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-[#3A3A3A] text-white' : 'text-white'
                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                      {option.label}
                      {option.count !== undefined && (
                        <span className="text-[#A0A0A0] ml-1">({option.count})</span>
                      )}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[#7B21BA]">
                        <Check className="h-5 w-5" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
