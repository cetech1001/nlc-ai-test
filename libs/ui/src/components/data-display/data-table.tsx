import * as React from "react"
import { cn } from "../../utils/cn"

export interface DataTableColumn<T> {
  key: keyof T
  header: string
  render?: (value: any, row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  onRowClick?: (row: T) => void
  className?: string
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
  className,
  loading = false,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded mb-2"></div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
        <tr>
          {columns.map((column) => (
            <th
              key={String(column.key)}
              className={cn(
                "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                column.className
              )}
            >
              {column.header}
            </th>
          ))}
        </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
        {data.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            onClick={() => onRowClick?.(row)}
            className={cn(
              "hover:bg-gray-50 transition-colors",
              onRowClick && "cursor-pointer"
            )}
          >
            {columns.map((column) => (
              <td
                key={String(column.key)}
                className={cn(
                  "px-6 py-4 whitespace-nowrap text-sm text-gray-900",
                  column.className
                )}
              >
                {column.render
                  ? column.render(row[column.key], row)
                  : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
