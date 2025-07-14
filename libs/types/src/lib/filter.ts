export type FilterType = 'select' | 'multi-select' | 'date-range' | 'search' | 'number-range' | 'amount-range';

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  placeholder?: string;
  defaultValue?: any;
}

export interface FilterValues {
  [key: string]: any;
}

export interface DataFilterProps {
  filters: FilterConfig[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onReset?: () => void;
  trigger?: 'button' | 'popover';
  buttonText?: string;
  showActiveCount?: boolean;
  className?: string;
  setIsFilterOpen: (isFilterOpen: boolean) => void;
}
