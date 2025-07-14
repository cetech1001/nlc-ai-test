'use client'

import { useState, useEffect, Fragment, useCallback } from 'react';
import { Dialog, Transition, Popover } from '@headlessui/react';
import {
  X,
  RotateCcw,
  Settings2
} from 'lucide-react';
import { Button } from '@nlc-ai/ui';
import {SearchFilter, SelectFilter, MultiSelectFilter, DateRangeFilter, NumberRangeFilter} from "./filters";
import {DataFilterProps, FilterConfig, FilterValues} from "@nlc-ai/types";

export const DataFilter = ({
 filters,
 values,
 onChange,
 onReset,
 trigger = 'button',
 buttonText = 'Filters',
 showActiveCount = true,
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
  }, [isOpen, setIsFilterOpen]);

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

  // Update temp values when external values change - but prevent loops
  useEffect(() => {
    // Only update if values actually changed
    const valuesChanged = JSON.stringify(tempValues) !== JSON.stringify(values);
    if (valuesChanged) {
      setTempValues(values);
    }
  }, [values]); // Remove tempValues from dependencies to prevent loop

  // Memoize the filter change handler with better logic
  const handleFilterChange = useCallback((key: string, newValue: any) => {

    setTempValues(prev => {
      const updated = {
        ...prev,
        [key]: newValue
      };
      return updated;
    });
  }, []);

  const handleApply = useCallback(() => {
    onChange(tempValues);
    setIsOpen(false);
  }, [tempValues, onChange]);

  const handleReset = useCallback(() => {
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
          resetValues[filter.key] = filter.defaultValue !== undefined ? filter.defaultValue : '';
      }
    });

    setTempValues(resetValues);
    onChange(resetValues);
    onReset?.();
    setIsOpen(false);
  }, [filters, onChange, onReset]);

  const renderFilterInput = useCallback((filter: FilterConfig) => {
    const value = tempValues[filter.key];

    switch (filter.type) {
      case 'search':
        return (
          <SearchFilter value={value} filter={filter} handleFilterChange={handleFilterChange}/>
        );

      case 'select':
        return (
          <SelectFilter value={value} filter={filter} handleFilterChange={handleFilterChange}/>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <MultiSelectFilter selectedValues={selectedValues} filter={filter} handleFilterChange={handleFilterChange}/>
        );

      case 'date-range':
        const dateValue = value || { start: '', end: '' };
        return (
          <DateRangeFilter dateValue={dateValue} filter={filter} handleFilterChange={handleFilterChange}/>
        );

      case 'number-range':
        const numberValue = value || { min: '', max: '' };
        return (
          <NumberRangeFilter numberValue={numberValue} filter={filter} handleFilterChange={handleFilterChange}/>
        );

      default:
        return null;
    }
  }, [tempValues, handleFilterChange]);

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
