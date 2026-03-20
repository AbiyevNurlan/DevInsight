import React from 'react'

export function Card({ children }: { children: React.ReactNode }){
  return (
    <div className="glass-panel p-4 md:p-5">{children}</div>
  )
}
