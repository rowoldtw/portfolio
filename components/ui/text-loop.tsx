'use client'
import { cn } from '@/lib/utils'
import {
  motion,
  AnimatePresence,
  Transition,
  Variants,
  AnimatePresenceProps,
} from 'motion/react'
import { useState, useEffect, useRef, Children } from 'react'

export type TextLoopProps = {
  children: React.ReactNode[]
  className?: string
  interval?: number
  transition?: Transition
  variants?: Variants
  onIndexChange?: (index: number) => void
  trigger?: boolean
  mode?: AnimatePresenceProps['mode']
  pauseOnHover?: boolean
}

export function TextLoop({
  children,
  className,
  interval = 2,
  transition = { duration: 0.3 },
  variants,
  onIndexChange,
  trigger = true,
  mode = 'popLayout',
  pauseOnHover = false,
}: TextLoopProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const currentIndexRef = useRef(0)
  const [isPaused, setIsPaused] = useState(false)
  const items = Children.toArray(children)

  useEffect(() => {
    if (!trigger || isPaused || items.length === 0) return

    const intervalMs = interval * 1000
    const timer = setInterval(() => {
      const next = (currentIndexRef.current + 1) % items.length
      currentIndexRef.current = next
      setCurrentIndex(next)
      onIndexChange?.(next)
    }, intervalMs)
    return () => clearInterval(timer)
  }, [items.length, interval, isPaused, onIndexChange, trigger])

  const motionVariants: Variants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  }

  return (
    <div
      className={cn('relative inline-block whitespace-nowrap', className)}
      onMouseEnter={() => {
        if (pauseOnHover) setIsPaused(true)
      }}
      onMouseLeave={() => {
        if (pauseOnHover) setIsPaused(false)
      }}
    >
      <AnimatePresence mode={mode} initial={false}>
        <motion.div
          key={currentIndex}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transition}
          variants={variants || motionVariants}
        >
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
