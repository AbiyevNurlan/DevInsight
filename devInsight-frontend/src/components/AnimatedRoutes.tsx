import React from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

interface AnimatedRoutesProps {
  children: React.ReactNode
}

/**
 * Wrapper that enables smooth page transitions for route changes
 */
export default function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation()

  const pageVariants = {
    initial: {
      opacity: 0,
      scale: 0.96,
      y: 20,
      filter: 'blur(8px)',
    },
    animate: {
      opacity: 1,
      scale: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 1.02,
      y: -20,
      filter: 'blur(8px)',
      transition: {
        duration: 0.35,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="relative w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
