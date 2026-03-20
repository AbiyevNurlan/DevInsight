import React, { useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

/**
 * Scroll-responsive motion layer that adapts to user scrolling
 * Creates flowing, spiritual gradients that respond to scroll position
 */
export default function ScrollMotion() {
  const { scrollYProgress } = useScroll()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Transform scroll progress into motion values
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%'])
  const backgroundScale = useTransform(scrollYProgress, [0, 1], [1, 1.2])
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6])

  // Track mouse movement for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      {/* Flowing gradient layer - responds to scroll */}
      <motion.div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(
              circle at ${mousePosition.x}% ${mousePosition.y}%,
              rgba(139, 92, 246, 0.25) 0%,
              rgba(59, 130, 246, 0.2) 30%,
              rgba(16, 185, 129, 0.15) 60%,
              transparent 100%
            )
          `,
          filter: 'blur(80px)',
          mixBlendMode: 'screen',
          y: backgroundY,
          scale: backgroundScale,
          opacity,
        }}
      />

      {/* Orbital wave layer - continuous flowing motion */}
      <motion.div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: `
            conic-gradient(
              from 0deg at 50% 50%,
              rgba(139, 92, 246, 0.15) 0deg,
              rgba(59, 130, 246, 0.12) 60deg,
              rgba(16, 185, 129, 0.15) 120deg,
              rgba(236, 72, 153, 0.12) 180deg,
              rgba(139, 92, 246, 0.15) 240deg,
              rgba(59, 130, 246, 0.12) 300deg,
              rgba(139, 92, 246, 0.15) 360deg
            )
          `,
          filter: 'blur(100px)',
          mixBlendMode: 'screen',
        }}
        animate={{
          rotate: [0, 360],
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: {
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          },
          scale: {
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          },
        }}
      />

      {/* Particle glow layer - subtle spiritual particles */}
      <motion.div
        className="fixed inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(
              circle at 20% 30%,
              rgba(139, 92, 246, 0.3) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(59, 130, 246, 0.25) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 50% 50%,
              rgba(16, 185, 129, 0.2) 0%,
              transparent 60%
            )
          `,
          filter: 'blur(60px)',
          mixBlendMode: 'screen',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </>
  )
}
