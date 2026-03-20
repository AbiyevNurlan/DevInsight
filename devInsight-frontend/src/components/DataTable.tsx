import React from 'react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  onRowClick?: (item: T) => void
  keyField?: keyof T
  emptyMessage?: string
  variant?: 'glass' | 'simple'
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading,
  onRowClick,
  keyField = 'id' as keyof T,
  emptyMessage = 'No data available',
  variant = 'glass'
}: DataTableProps<T>) {
  const containerClass = variant === 'glass'
    ? "glass-panel overflow-hidden"
    : "bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden";

  const headerClass = variant === 'glass' ? "bg-white/5" : "bg-gray-50 border-b border-gray-200";
  const textHeaderClass = variant === 'glass' ? "text-white/50" : "text-gray-500";
  const divideClass = variant === 'glass' ? "divide-white/10" : "divide-gray-200";
  const rowHoverClass = variant === 'glass' ? "hover:bg-white/5" : "hover:bg-gray-50";
  const textCellClass = variant === 'glass' ? "text-white" : "text-gray-900";
  if (loading) {
    return (
      <div className={containerClass}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400 mx-auto"></div>
          <p className={`mt-2 text-sm ${textCellClass}`}>Loading...</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={containerClass}>
        <div className={`p-8 text-center ${textCellClass}`}>
          {emptyMessage}
        </div>
      </div>
    )
  }

  return (
    <div className={containerClass}>
      <div className="overflow-x-auto">
        <table className={`min-w-full divide-y ${divideClass}`}>
          <thead className={headerClass}>
            <tr>
              {columns.map((col, idx) => (
                <th
                  key={String(col.key) + idx}
                  className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider first:pl-6 ${textHeaderClass}`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={`divide-y ${divideClass} bg-transparent`}>
            {data.map((item, rowIdx) => (
              <tr
                key={String(item[keyField]) || rowIdx}
                onClick={() => onRowClick?.(item)}
                className={onRowClick ? `cursor-pointer transition-colors ${rowHoverClass}` : ''}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={String(col.key) + colIdx}
                    className={`px-6 py-4 whitespace-nowrap text-sm first:pl-6 ${textCellClass}`}
                  >
                    {col.render ? col.render(item) : String(item[col.key as keyof T] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
