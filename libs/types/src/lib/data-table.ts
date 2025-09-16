import { ReactNode } from "react";

export interface TableAction {
  label: string;
  action: string;
  className?: string;
  variant?: 'default' | 'primary' | 'danger';
}

export interface MobileFieldConfig {
  key: string;
  label?: string;
  render?: (value: any, row: any) => ReactNode;
  priority: 'primary' | 'secondary' | 'detail' | 'status';
}

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  className?: string;
  headerClassName?: string;
  render?: (value: any, row: T, onRowAction?: (action: string, row: T) => void) => React.ReactNode;
  // New mobile configuration
  mobile?: {
    show: boolean;
    priority?: 'primary' | 'secondary' | 'detail' | 'status';
    label?: string;
    render?: (value: any, row: T) => ReactNode;
  };
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowAction?: (action: string, row: T) => void;
  actions?: TableAction[];
  showMobileCards?: boolean;
  emptyMessage?: string;
  isLoading?: boolean;
  className?: string;
  // New mobile configuration option
  mobileConfig?: {
    primaryField?: string;
    secondaryField?: string;
    statusField?: string;
    detailFields?: string[];
    maxDetailFields?: number;
  };
}
