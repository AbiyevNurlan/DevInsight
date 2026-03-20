import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  hoverScale?: number
}

/**
 * Animated card component with scroll-triggered fade-in and hover micro-interactions
 */
export default function AnimatedCard({ 
  children, 
  className = '', 
  delay = 0,
  hoverScale = 1.02 
}: AnimatedCardProps) {
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{
        scale: hoverScale,
        y: -4,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
