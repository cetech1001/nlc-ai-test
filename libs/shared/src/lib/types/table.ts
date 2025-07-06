import React from "react";

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: string;
  className?: string;
  headerClassName?: string;
  render?: (value: any, row: T, onAction?: (action: string, row: T) => void) => React.ReactNode;
}

export interface TableAction {
  label: string;
  action: string;
  className?: string;
  variant?: 'default' | 'primary' | 'danger';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  onRowAction?: (action: string, row: any) => void;
  className?: string;
  actions?: TableAction[];
  showMobileCards?: boolean;
  emptyMessage?: string;
}
