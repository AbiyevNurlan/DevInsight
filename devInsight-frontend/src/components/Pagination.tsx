import React from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange?: (size: number) => void
}

export default function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange
}: PaginationProps) {
  const startItem = page * size + 1
  const endItem = Math.min((page + 1) * size, totalElements)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showPages = 5

    if (totalPages <= showPages) {
      return Array.from({ length: totalPages }, (_, i) => i)
    }

    pages.push(0)

    let start = Math.max(1, page - 1)
    let end = Math.min(totalPages - 2, page + 1)

    if (page < 3) {
      end = Math.min(showPages - 2, totalPages - 2)
    } else if (page > totalPages - 4) {
      start = Math.max(1, totalPages - showPages + 1)
    }

    if (start > 1) pages.push('...')

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (end < totalPages - 2) pages.push('...')

    if (totalPages > 1) pages.push(totalPages - 1)

    return pages
  }

  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-white/10 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-lg text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-white/10 text-sm font-medium rounded-lg text-white bg-white/5 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm text-text-secondary">
            Showing <span className="font-medium text-white">{totalElements > 0 ? startItem : 0}</span> to{' '}
            <span className="font-medium text-white">{endItem}</span> of{' '}
            <span className="font-medium text-white">{totalElements}</span> results
          </p>
          {onSizeChange && (
            <select
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="border border-white/10 bg-background text-white rounded-lg text-sm py-1 px-2 focus:outline-none focus:border-primary/50"
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="25">25 / page</option>
              <option value="50">50 / page</option>
            </select>
          )}
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-white/10 bg-white/5 text-sm font-medium text-text-muted hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ←
            </button>
            {getPageNumbers().map((p, idx) => (
              typeof p === 'number' ? (
                <button
                  key={idx}
                  onClick={() => onPageChange(p)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${p === page
                      ? 'z-10 bg-primary/20 border-primary/30 text-primary'
                      : 'bg-white/5 border-white/10 text-text-muted hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {p + 1}
                </button>
              ) : (
                <span key={idx} className="relative inline-flex items-center px-4 py-2 border border-white/10 bg-white/5 text-sm font-medium text-text-muted">
                  {p}
                </span>
              )
            ))}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-white/10 bg-white/5 text-sm font-medium text-text-muted hover:bg-white/10 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              →
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
