import { ChevronDown } from 'lucide-react';
import {TableProps} from "../../types";

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
              data.map((row, index) => {
                const primaryField = columns.find(col => col.key === 'name') || columns[0];
                const secondaryField = columns.find(col => col.key === 'id') || columns[1];
                const statusField = columns.find(col => col.key === 'status');
                const actionsColumn = columns.find(col => col.key === 'actions');

                const detailFields = columns.filter(col =>
                  col.key !== primaryField?.key &&
                  col.key !== secondaryField?.key &&
                  col.key !== statusField?.key &&
                  col.key !== actionsColumn?.key
                );

                return (
                  // @ts-ignore
                  <div key={row.id || index} className="relative bg-gradient-to-b from-neutral-800/30 to-neutral-900/30 rounded-[30px] border border-neutral-700 p-4 overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute w-32 h-32 -left-6 -top-10 bg-gradient-to-l from-fuchsia-200 via-fuchsia-600 to-violet-600 rounded-full blur-[56px]" />
                    </div>
                    <div className="relative z-10 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-stone-50 font-medium text-base leading-tight truncate">
                            {primaryField?.render ? (
                              <div className="truncate">
                                {/* @ts-ignore */}
                                {primaryField.render(row[primaryField.key], row, onRowAction)}
                              </div>
                            ) : (
                              /* @ts-ignore */
                              row[primaryField?.key] || 'N/A'
                            )}
                          </h3>
                          {secondaryField && secondaryField.key !== primaryField?.key && (
                            <p className="text-stone-300 text-sm leading-tight mt-0.5">
                              {secondaryField.render ? (
                                <span className="truncate">
                                  {/* @ts-ignore */}
                                  {secondaryField.render(row[secondaryField.key], row, onRowAction)}
                                </span>
                              ) : (
                                /* @ts-ignore */
                                row[secondaryField.key] || 'N/A'
                              )}
                            </p>
                          )}
                        </div>

                        {statusField && (
                          <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                            {statusField.render ? (
                              <div className="flex items-center gap-2">
                                {/* @ts-ignore */}
                                {statusField.render(row[statusField.key], row, onRowAction)}
                              </div>
                            ) : (
                              <>
                          <span className={`text-sm font-medium whitespace-nowrap ${
                            /* @ts-ignore */
                            row[statusField.key] === "Active" || row[statusField.key] === "Converted"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}>
                            {/* @ts-ignore */}
                            {row[statusField.key]}
                          </span>
                                <ChevronDown className="w-4 h-4 text-stone-50" />
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {detailFields.length > 0 && (
                        <div className="text-stone-300 text-sm leading-tight space-y-1">
                          {detailFields.slice(0, 1).map((field, fieldIndex) => (
                            <div key={field.key}>
                              {/*@ts-ignore*/}
                              {row[field.key]}
                            </div>
                          ))}

                          {detailFields.length > 1 && (
                            <p className="text-xs">
                              {detailFields.slice(1, 3).map((field, fieldIndex) => (
                                <span key={field.key}>
                                  {fieldIndex > 0 && <span className="text-stone-500 mx-1">•</span>}
                                  <span className={fieldIndex === 0 ? "text-stone-400" : "text-stone-300"}>
                                      {/*@ts-ignore*/}
                                      {row[field.key]}
                                  </span>
                                </span>
                              ))}
                            </p>
                          )}
                        </div>
                      )}

                      {actionsColumn && (
                        <div className="pt-1">
                          {actionsColumn.render ? (
                            /* @ts-ignore */
                            actionsColumn.render(row[actionsColumn.key], row, onRowAction)
                          ) : (
                            <button
                              onClick={() => onRowAction?.('default', row)}
                              className="text-fuchsia-400 text-sm font-medium underline hover:text-fuchsia-300 transition-colors"
                            >
                              Action
                            </button>
                          )}
                        </div>
                      )}

                      {!actionsColumn && actions.length > 0 && (
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
                );
              })
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
  status: (value: string) => {
    const statusColors: Record<string, string> = {
      'Active': 'text-green-400',
      'Inactive': 'text-red-400',
      'Blocked': 'text-blue-400',
      'Converted': 'text-green-400',
      'No Show': 'text-red-400',
      'Not Converted': 'text-yellow-400',
      'Scheduled': 'text-blue-400',
    };
    return (
      <div className="flex items-center gap-2">
        <span className={`text-sm font-normal leading-relaxed ${statusColors[value] || 'text-gray-400'}`}>
          {value}
        </span>
        <ChevronDown className="w-4 h-4 text-stone-50"/>
      </div>
    );
  },

  actions: <T,>(value: string, row: T, action: string, onAction?: (action: string, row: any) => void) => (
    <div className="inline-flex items-center justify-end gap-2">
      <button
        onClick={() => onAction?.(action, row)}
        className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
      >
        {value}
      </button>
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

  currencyText: (value: number) => (
    <span className="text-stone-50 font-normal leading-relaxed whitespace-nowrap">
      ${value.toLocaleString()}
    </span>
  ),

  coachActions: (_: string, coach: any, onRowAction?: (action: string, row: any) => void) => {
    return (
      <div className="flex gap-2">
        {coach.rawStatus !== 'deleted' && (
          <>
            <button
              onClick={() => onRowAction?.('toggle-status', coach)}
              className={`px-3 py-1 rounded text-sm ${
                coach.rawStatus === 'blocked'
                  ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30'
                  : 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30'
              }`}
            >
              {coach.rawStatus === 'blocked' ? 'Unblock' : 'Block'}
            </button>
            <button
              onClick={() => onRowAction?.('delete', coach)}
              className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30"
            >
              Delete
            </button>
          </>
        )}
        {coach.rawStatus === 'deleted' && (
          <span className="px-3 py-1 rounded text-sm bg-red-600/20 text-red-400">
          Marked for Deletion
        </span>
        )}
        <button
          onClick={() => onRowAction?.('make-payment', coach)}
          className="text-fuchsia-400 text-sm font-normal underline leading-relaxed hover:text-fuchsia-300 transition-colors whitespace-nowrap"
          disabled={coach.rawStatus === 'deleted'}
        >
          Make Payment
        </button>
      </div>
    );
  }
};
