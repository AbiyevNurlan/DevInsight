import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation, Outlet } from 'react-router-dom'

interface PageTransitionProps {
  children?: React.ReactNode
}

/**
 * Cinematic page transition wrapper with fade-in, scale, and orbital motion
 * Creates a smooth, futuristic transition effect between routes
 */
export default function PageTransition({ children }: PageTransitionProps) {
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
        ease: [0.22, 1, 0.36, 1], // Custom easing for smooth cinematic feel
        staggerChildren: 0.08,
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

  const orbitalVariants = {
    initial: {
      rotate: 0,
      scale: 0.8,
      opacity: 0,
    },
    animate: {
      rotate: 360,
      scale: 1,
      opacity: 0.4,
      transition: {
        duration: 20,
        ease: 'linear',
        repeat: Infinity,
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
        {/* Orbital motion layer - subtle rotating gradient */}
        <motion.div
          variants={orbitalVariants}
          className="absolute inset-0 pointer-events-none -z-10"
          style={{
            background: `
              conic-gradient(
                from 0deg at 50% 50%,
                rgba(0, 217, 255, 0.18) 0deg,
                rgba(168, 85, 247, 0.15) 90deg,
                rgba(16, 185, 129, 0.18) 180deg,
                rgba(236, 72, 153, 0.15) 270deg,
                rgba(0, 217, 255, 0.18) 360deg
              )
            `,
            filter: 'blur(60px)',
            mixBlendMode: 'screen',
          }}
        />

        {/* Content */}
        <motion.div
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1 },
            exit: { opacity: 0 },
          }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
