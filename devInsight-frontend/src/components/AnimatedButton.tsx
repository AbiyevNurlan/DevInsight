import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

interface AnimatedButtonProps {
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Apple HIG Animated Button
 * - Capsule shape
 * - Smooth spring scaling
 * - System colors
 */
export default function AnimatedButton({
  children,
  href,
  onClick,
  className = '',
  variant = 'primary',
  disabled = false,
  type = 'button',
}: AnimatedButtonProps) {

  const variants = {
    primary: 'bg-system-blue text-white shadow-lg shadow-system-blue/30 hover:bg-system-blue/90',
    secondary: 'bg-system-gray6 text-white border border-white/10 hover:bg-white/10',
    ghost: 'bg-transparent text-system-blue hover:bg-system-blue/10',
    glass: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20',
  }

  const spring = {
    type: "spring",
    stiffness: 300,
    damping: 20
  }

  const content = (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      initial={false}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      transition={spring}
      className={`
        relative px-6 py-3 rounded-full font-medium text-[15px] tracking-tight
        disabled:opacity-50 disabled:cursor-not-allowed transition-colors
        flex items-center justify-center gap-2
        ${variants[variant]} 
        ${className}
      `}
    >
      {children}
    </motion.button>
  )

  if (href) {
    return (
      <Link to={href} className="inline-block">
        {content}
      </Link>
    )
  }

  return content
}
