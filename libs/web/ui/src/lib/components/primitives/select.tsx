/// <reference lib="dom"/>

import {useState, useRef, useEffect, ReactNode, createContext, FC, useContext} from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
}

interface SelectTriggerProps {
  className?: string;
  children: ReactNode;
}

interface SelectContentProps {
  children: ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  className?: string;
  children: ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

const SelectContext = createContext<{
  isOpen: boolean;
  value?: string;
  selectedLabel?: string;
  onValueChange?: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  setSelectedLabel: (label: string) => void;
}>({
  isOpen: false,
  onOpenChange: () => {},
  setSelectedLabel: () => {},
});

export const Select: FC<SelectProps> = ({ value, onValueChange, children, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  return (
    <SelectContext.Provider value={{
      isOpen,
      value,
      selectedLabel,
      onValueChange,
      onOpenChange: setIsOpen,
      setSelectedLabel
    }}>
      <div className={`relative ${className || ''}`}>
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
        className={`flex items-center justify-between w-full px-3 py-2.5 text-left rounded-md border border-gray-600 bg-gray-800 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <div className="flex-1 min-w-0">
          {children}
        </div>
        <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
};

export const SelectContent: FC<SelectContentProps> = ({ children, className = '' }) => {
  const { isOpen } = useContext(SelectContext);

  if (!isOpen) return null;

  return (
    <div className={`absolute z-50 w-full mt-1 rounded-md shadow-lg border border-gray-600 bg-gray-800 overflow-hidden ${className}`}>
      <div className="py-1 max-h-60 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export const SelectItem: FC<SelectItemProps> = ({ value, children, className = '' }) => {
  const { value: selectedValue, onValueChange, onOpenChange, setSelectedLabel } = useContext(SelectContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    console.log("Clicked: ", value);
    onValueChange?.(value);
    setSelectedLabel(typeof children === 'string' ? children : value);
    onOpenChange(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full px-3 py-2.5 text-left text-sm transition-colors focus:outline-none ${
        isSelected
          ? 'bg-purple-600/20 text-purple-100 font-medium'
          : 'text-gray-200 hover:bg-gray-700 focus:bg-gray-700'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const SelectValue: FC<SelectValueProps> = ({ placeholder, className = '' }) => {
  const { selectedLabel, value } = useContext(SelectContext);

  return (
    <span className={`block truncate ${(selectedLabel || value) ? 'text-current' : 'text-gray-400'} ${className}`}>
      {selectedLabel || value || placeholder}
    </span>
  );
};
