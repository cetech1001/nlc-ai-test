/// <reference lib="dom"/>
'use client'

import {useState, useRef, useEffect, ReactNode, createContext, FC, useContext} from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
}

interface SelectTriggerProps {
  className?: string;
  children: ReactNode;
}

interface SelectContentProps {
  children: ReactNode;
}

interface SelectItemProps {
  value: string;
  children: ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

const SelectContext = createContext<{
  isOpen: boolean;
  value?: string;
  onValueChange?: (value: string) => void;
  onOpenChange: (open: boolean) => void;
}>({
  isOpen: false,
  onOpenChange: () => {},
});

export const Select: FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ isOpen, value, onValueChange, onOpenChange: setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  );
};

export const SelectTrigger: FC<SelectTriggerProps> = ({ className = '', children }) => {
  const { isOpen, onOpenChange } = useContext(SelectContext);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div ref={dropdownRef}>
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-left bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${className}`}
      >
        {children}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};

export const SelectContent: FC<SelectContentProps> = ({ children }) => {
  const { isOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
      <div className="py-1 max-h-60 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export const SelectItem: FC<SelectItemProps> = ({ value, children }) => {
  const { value: selectedValue, onValueChange, onOpenChange } = useContext(SelectContext);

  const handleClick = () => {
    onValueChange?.(value);
    onOpenChange(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
        selectedValue === value ? 'bg-purple-50 text-purple-900' : 'text-gray-900'
      }`}
    >
      {children}
    </button>
  );
};

export const SelectValue: FC<SelectValueProps> = ({ placeholder }) => {
  const { value } = useContext(SelectContext);

  return (
    <span className={value ? 'text-gray-900' : 'text-gray-500'}>
      {value || placeholder}
    </span>
  );
};
