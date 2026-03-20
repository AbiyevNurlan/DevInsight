import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface SidebarItemProps {
  name: string
  href: string
  icon: LucideIcon
}

export default function SidebarItem({ name, href, icon: Icon }: SidebarItemProps) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(href) && href !== '/' || location.pathname === href

  return (
    <Link 
      to={href}
      aria-current={isActive ? 'page' : undefined}
      className={`relative flex items-center gap-3 px-6 py-3 transition-colors duration-200 group ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-primary hover:bg-zinc-900/50'}`}
    >
      {/* Active indicator bar */}
      {isActive && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
      
      {/* Icon with hover animation */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Icon 
          className={`w-[18px] h-[18px] transition-colors duration-200 ${isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-primary'}`} 
        />
      </motion.div>
      
      {/* Label */}
      <span className="text-sm font-medium">{name}</span>
    </Link>
  )
}
