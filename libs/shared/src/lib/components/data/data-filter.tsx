'use client'

import { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition, Listbox, Popover } from '@headlessui/react';
import {
  X,
  ChevronDown,
  Check,
  RotateCcw,
  Search, Settings2
} from 'lucide-react';
import { Button } from '@nlc-ai/ui';

// Filter types
export type FilterType = 'select' | 'multi-select' | 'date-range' | 'search' | 'number-range';

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number; // For showing result counts
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[]; // For select/multi-select
  placeholder?: string;
  defaultValue?: any;
}

export interface FilterValues {
  [key: string]: any;
}

interface DataFilterProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset?: () => void;

  // Display options
  trigger?: 'button' | 'popover'; // How to show filters
  buttonText?: string;
  showActiveCount?: boolean;

  // Styling
  className?: string;

  setIsFilterOpen: (isFilterOpen: boolean) => void;
}

export const DataFilter = ({
  filters,
  values,
  onChange,
  onReset,
  trigger = 'button',
  buttonText = 'Filters',
  showActiveCount = true,
  className = '',
  setIsFilterOpen,
}: DataFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValues, setTempValues] = useState<FilterValues>(values);

  // Update temp values when external values change
  useEffect(() => {
    setTempValues(values);
  }, [values]);

  useEffect(() => {
    setIsFilterOpen(isOpen);
  }, [isOpen]);

  // Count active filters
  const activeFilterCount = Object.keys(values).filter(key => {
    const value = values[key];
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value.trim() !== '';
    if (typeof value === 'object' && value !== null) {
      return Object.values(value).some(v => v !== null && v !== undefined && v !== '');
    }
    return value !== null && value !== undefined && value !== '';
  }).length;

  const handleFilterChange = (key: string, value: any) => {
    setTempValues(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onChange(tempValues);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetValues: FilterValues = {};
    filters.forEach(filter => {
      switch (filter.type) {
        case 'multi-select':
          resetValues[filter.key] = [];
          break;
        case 'date-range':
        case 'number-range':
          resetValues[filter.key] = { start: null, end: null };
          break;
        default:
          resetValues[filter.key] = filter.defaultValue || '';
      }
    });
    setTempValues(resetValues);
    onChange(resetValues);
    onReset?.();
    setIsOpen(false);
  };

  const renderFilterInput = (filter: FilterConfig) => {
    const value = tempValues[filter.key];

    switch (filter.type) {
      case 'search':
        return (
          <div className="relative">
            <input
              type="text"
              value={value || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder || 'Search...'}
              className="w-full pl-10 pr-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
          </div>
        );

      case 'select':
        return (
          <Listbox value={value || ''} onChange={(val) => handleFilterChange(filter.key, val)}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-[#2A2A2A] border border-[#3A3A3A] py-2 pl-3 pr-10 text-left text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]">
                <span className="block truncate">
                  {filter.options?.find(opt => opt.value === value)?.label || filter.placeholder || 'Select...'}
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
                    <span className="block truncate">All</span>
                  </Listbox.Option>
                  {filter.options?.map((option, optionIdx) => (
                    <Listbox.Option
                      key={optionIdx}
                      value={option.value}
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

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="text-sm text-[#A0A0A0]">
              {selectedValues.length} selected
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filter.options?.map((option, idx) => (
                <label key={idx} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      handleFilterChange(filter.key, newValues);
                    }}
                    className="w-4 h-4 text-[#7B21BA] bg-[#2A2A2A] border-[#3A3A3A] rounded focus:ring-[#7B21BA] focus:ring-2"
                  />
                  <span className="text-white text-sm">
                    {option.label}
                    {option.count !== undefined && (
                      <span className="text-[#A0A0A0] ml-1">({option.count})</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'date-range':
        const dateValue = value || { start: '', end: '' };
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Start Date</label>
              <input
                type="date"
                value={dateValue.start || ''}
                onChange={(e) => handleFilterChange(filter.key, { ...dateValue, start: e.target.value })}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">End Date</label>
              <input
                type="date"
                value={dateValue.end || ''}
                onChange={(e) => handleFilterChange(filter.key, { ...dateValue, end: e.target.value })}
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
              />
            </div>
          </div>
        );

      case 'number-range':
        const numberValue = value || { min: '', max: '' };
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Min {filter.label}</label>
              <input
                type="number"
                value={numberValue.min || ''}
                onChange={(e) => handleFilterChange(filter.key, { ...numberValue, min: e.target.value })}
                placeholder="0"
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
              />
            </div>
            <div>
              <label className="block text-sm text-[#A0A0A0] mb-1">Max {filter.label}</label>
              <input
                type="number"
                value={numberValue.max || ''}
                onChange={(e) => handleFilterChange(filter.key, { ...numberValue, max: e.target.value })}
                placeholder="1000"
                className="w-full px-3 py-2 bg-[#2A2A2A] border border-[#3A3A3A] rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#7B21BA]/50 focus:border-[#7B21BA]"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (trigger === 'popover') {
    return (
      <Popover className="relative">
        <Popover.Button className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity p-2 relative">
          <Settings2 className="w-5 h-5 text-white" />
          {showActiveCount && activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Popover.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <Popover.Panel className="absolute right-0 z-10 mt-3 w-80 transform">
            <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-white">Filters</h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={handleReset}
                      className="text-[#7B21BA] hover:text-[#8B31CA] text-sm flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {filters.map((filter) => (
                    <div key={filter.key}>
                      <label className="block text-sm font-medium text-white mb-2">
                        {filter.label}
                      </label>
                      {renderFilterInput(filter)}
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-[#2A2A2A]">
                  <Button
                    onClick={handleApply}
                    className="flex-1 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </Popover.Panel>
        </Transition>
      </Popover>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-10 h-10 bg-gradient-to-r from-fuchsia-600 via-purple-700 to-violet-600 rounded-xl flex items-center justify-center hover:opacity-90 transition-opacity p-2 relative"
      >
        <Settings2 className="w-5 h-5 text-white" />
        {showActiveCount && activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[linear-gradient(202deg,rgba(38,38,38,0.30)_11.62%,rgba(19,19,19,0.30)_87.57%)] border border-[#2A2A2A] p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white">
                      {buttonText}
                    </Dialog.Title>
                    <div className="flex items-center gap-2">
                      {activeFilterCount > 0 && (
                        <button
                          onClick={handleReset}
                          className="text-[#7B21BA] hover:text-[#8B31CA] text-sm flex items-center gap-1"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </button>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="text-[#A0A0A0] hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6 max-h-96 overflow-y-auto">
                    {filters.map((filter) => (
                      <div key={filter.key}>
                        <label className="block text-sm font-medium text-white mb-2">
                          {filter.label}
                        </label>
                        {renderFilterInput(filter)}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3 mt-6 pt-6 border-t border-[#2A2A2A]">
                    <Button
                      onClick={handleApply}
                      className="flex-1 bg-gradient-to-t from-fuchsia-200 via-fuchsia-600 to-violet-600 text-white"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      onClick={() => setIsOpen(false)}
                      variant="outline"
                      className="flex-1 bg-transparent border-[#3A3A3A] text-white hover:bg-[#2A2A2A]"
                    >
                      Cancel
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

// Usage Examples:

// For Coaches Page
/*
const coachFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { label: 'Active', value: 'active', count: 45 },
      { label: 'Inactive', value: 'inactive', count: 12 },
      { label: 'Blocked', value: 'blocked', count: 3 },
    ],
  },
  {
    key: 'plan',
    label: 'Subscription Plan',
    type: 'multi-select',
    options: [
      { label: 'Solo Agent', value: 'solo_agent', count: 20 },
      { label: 'Growth Pro', value: 'growth_pro', count: 25 },
      { label: 'Scale Elite', value: 'scale_elite', count: 15 },
    ],
  },
  {
    key: 'dateJoined',
    label: 'Date Joined',
    type: 'date-range',
  },
];

<DataFilter
  filters={coachFilters}
  values={filterValues}
  onChange={setFilterValues}
  onReset={() => setFilterValues({})}
/>
*/

// For Transactions Page
/*
const transactionFilters: FilterConfig[] = [
  {
    key: 'status',
    label: 'Transaction Status',
    type: 'select',
    options: [
      { label: 'Completed', value: 'completed', count: 156 },
      { label: 'Pending', value: 'pending', count: 23 },
      { label: 'Failed', value: 'failed', count: 8 },
      { label: 'Refunded', value: 'refunded', count: 4 },
    ],
  },
  {
    key: 'amount',
    label: 'Amount',
    type: 'number-range',
  },
  {
    key: 'dateRange',
    label: 'Transaction Date',
    type: 'date-range',
  },
  {
    key: 'paymentMethod',
    label: 'Payment Method',
    type: 'multi-select',
    options: [
      { label: 'Credit Card', value: 'credit_card' },
      { label: 'PayPal', value: 'paypal' },
      { label: 'Bank Transfer', value: 'bank_transfer' },
    ],
  },
];
*/
