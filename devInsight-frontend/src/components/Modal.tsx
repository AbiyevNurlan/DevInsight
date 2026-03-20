import React from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>

        {/* Modal panel */}
        <div className={`inline-block w-full ${sizeClasses[size]} p-8 my-8 overflow-hidden text-left align-middle transition-all transform glass-card relative`}>
          {/* Neon Glow Border Effect */}
          <div className="absolute inset-0 pointer-events-none rounded-3xl ring-1 ring-white/10" />

          {/* Header */}
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-white transition-all p-2 hover:bg-white/10 rounded-full hover:rotate-90 active:scale-90"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="text-text-primary relative z-10">{children}</div>
        </div>
      </div>
    </div>
  )
}
