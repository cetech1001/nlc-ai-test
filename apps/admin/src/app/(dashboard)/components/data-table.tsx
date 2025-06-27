import React from 'react';
import { ChevronDown } from 'lucide-react';

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

export const DataTable = <T,>({
  columns,
  data,
  onRowAction,
  className = "",
  actions = [],
  showMobileCards = true,
  emptyMessage = "No data available"
}: TableProps<T>) => {
  const getGridTemplate = () => {
    return columns.map(col => col.width || '1fr').join(' ');
  };

  const getMinTableWidth = () => {
    const totalFixedWidth = columns.reduce((total, col) => {
      if (col.width && col.width.includes('px')) {
        return total + parseInt(col.width);
      }
      return total + 150; // Default minimum width per column
    }, 0);

    const gaps = (columns.length - 1) * 16; // 4 * 4px gap between columns
    const padding = 48; // 24px padding on each side

    return `${totalFixedWidth + gaps + padding}px`;
  };

  return (
    <>
      {showMobileCards && (
        <div className="block sm:hidden">
          <div className="space-y-4">
            {data.length === 0 ? (
              <div className="text-center py-8 text-stone-400">{emptyMessage}</div>
            ) : (
              data.map((row, index) => (
                // @ts-ignore
                <div key={row.id || index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 overflow-hidden">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                  </div>
                  <div className="relative z-10 space-y-3">
                    {columns.slice(0, -1).map((column) => (
                      <div key={column.key} className="flex justify-between items-start">
                        <span className="text-stone-400 text-sm font-medium">{column.header}:</span>
                        <div className="flex-1 ml-3 text-right">
                          {/*@ts-ignore*/}
                          {column.render ? column.render(row[column.key], row, onRowAction) : (
                            <span className="text-stone-50 text-sm">
                              {/*@ts-ignore*/}
                              {row[column.key]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {actions.length > 0 && (
                      <div className="flex gap-2 pt-2 border-t border-neutral-700">
                        {actions.map((action) => (
                          <button
                            key={action.action}
                            onClick={() => onRowAction?.(action.action, row)}
                            className={`text-sm font-medium transition-colors ${
                              action.variant === 'primary' ? 'text-fuchsia-400 hover:text-fuchsia-300' :
                                action.variant === 'danger' ? 'text-red-400 hover:text-red-300' :
                                  'text-stone-300 hover:text-stone-50'
                            } ${action.className || ''}`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div className={`${showMobileCards ? 'hidden sm:block' : ''}`}>
        <div className="overflow-x-auto">
          <div className={`relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 overflow-hidden ${className}`} style={{ minWidth: 'max-content' }}>
            <div className="absolute inset-0 opacity-20">
              {[...Array(Math.min(columns.length, 7))].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-56 h-56 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[112px]"
                  style={{
                    left: `${-46 + i * 290}px`,
                    top: i === 0 ? '-80px' : '-40px',
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <div className="h-16 rounded-tl-[30px] rounded-tr-[30px] flex items-center bg-[#7B21BA] px-6" style={{ minWidth: getMinTableWidth() }}>
                <div
                  className="w-full grid gap-4 text-sm lg:text-base"
                  style={{ gridTemplateColumns: getGridTemplate() }}
                >
                  {columns.map((column) => (
                    <div key={column.key} className={`text-stone-50 font-semibold leading-relaxed text-left ${column.headerClassName || column.className || ''}`}>
                      {column.header}
                    </div>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-neutral-700">
                {data.length === 0 ? (
                  <div className="h-32 flex items-center justify-center" style={{ minWidth: getMinTableWidth() }}>
                    <span className="text-stone-400 text-lg">{emptyMessage}</span>
                  </div>
                ) : (
                  data.map((row, index) => (
                    // @ts-ignore
                    <div key={row.id || index} className="h-16 flex items-center px-6 hover:bg-black/10 transition-colors" style={{ minWidth: getMinTableWidth() }}>
                      <div
                        className="w-full grid gap-4 items-center text-sm lg:text-base"
                        style={{ gridTemplateColumns: getGridTemplate() }}
                      >
                        {columns.map((column) => (
                          <div key={column.key} className={`text-left ${column.className || ''}`}>
                            {/*@ts-ignore*/}
                            {column.render ? column.render(row[column.key], row, onRowAction) : (
                              <span className="text-stone-50 font-normal leading-relaxed">
                                {/*@ts-ignore*/}
                                {row[column.key]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const tableRenderers = {
  status: (value: string) => (
    <div className="flex items-center gap-2">
      <span className={`text-sm font-normal leading-relaxed ${
        value === "Active" ? "text-green-600" : "text-red-600"
      }`}>
        {value}
      </span>
      <ChevronDown className="w-4 h-4 text-stone-50" />
    </div>
  ),

  actions: <T,>(value: string, row: T, action: string, onAction?: (action: string, row: any) => void) => (
    <div className="inline-flex items-center justify-end gap-2">
      <button
        onClick={() => onAction?.(action, row)}
        className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
      >
        {value}
      </button>
      {/*<button
        onClick={() => onAction?.('menu', row)}
        className="text-stone-50 hover:text-stone-300 transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>*/}
    </div>
  ),

  truncateText: (value: string, maxLength: number = 30) => (
    <span className="text-stone-50 font-normal leading-relaxed truncate" title={value}>
      {value.length > maxLength ? `${value.substring(0, maxLength)}...` : value}
    </span>
  ),

  basicText: (value: string) => (
    <span className="text-stone-50 font-normal leading-relaxed">
    {value}
  </span>
  ),

  dateText: (value: string) => (
    <span className="text-stone-50 font-normal leading-relaxed whitespace-nowrap">
    {value}
  </span>
  ),

  simpleStatus: (value: string) => (
    <div className="inline-flex items-center gap-2">
      <span className={`text-sm font-normal leading-relaxed ${
        value === "Active" ? "text-green-600" : "text-red-600"
      }`}>
        {value}
      </span>
      <ChevronDown className="w-4 h-4 text-stone-50" />
    </div>
  ),

  simpleActions: <T,>(_: string, row: T, onAction?: (action: string, row: T) => void) => (
    <button
      onClick={() => onAction?.('payment', row)}
      className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
    >
      Make Payment
    </button>
  ),

  currencyText: (value: number) => (
    <span className="text-stone-50 font-normal leading-relaxed whitespace-nowrap">
      ${value.toLocaleString()}
    </span>
  ),
};
