'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { useTheme } from '@/components/theme-provider'
import { animateThemeChange } from '@/components/theme-transition'

import { cn } from '@/lib/utils'

type AnimatedThemeTogglerProps = {
  className?: string
}

export function AnimatedThemeToggler({ className }: AnimatedThemeTogglerProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [isTransitioning, setIsTransitioning] = React.useState(false)
  const clipPathId = React.useId().replaceAll(':', '')
  const isDark = resolvedTheme === 'dark'

  const toggleTheme = React.useCallback(() => {
    const switchTheme = () => setTheme(isDark ? 'light' : 'dark')
    if (isTransitioning) {
      switchTheme()
      return
    }

    const transition = animateThemeChange(switchTheme)
    if (!transition) return

    setIsTransitioning(true)
    void transition.finished.finally(() => setIsTransitioning(false))
  }, [isDark, isTransitioning, setTheme])

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      className={cn(
        'inline-flex size-7 items-center justify-center rounded-full bg-black/[0.035] text-zinc-600 transition-colors duration-200 hover:bg-black/[0.07] hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none disabled:cursor-default dark:bg-white/[0.06] dark:text-zinc-300 dark:hover:bg-white/[0.1] dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500/60',
        className,
      )}
      disabled={isTransitioning}
    >
      <svg
        aria-hidden="true"
        className="size-4"
        fill="currentColor"
        strokeLinecap="round"
        viewBox="0 0 32 32"
      >
        <clipPath id={clipPathId}>
          <motion.path
            initial={false}
            animate={{ y: isDark ? 10 : 0, x: isDark ? -12 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            d="M0-5h30a1 1 0 0 0 9 13v24H0Z"
          />
        </clipPath>
        <g clipPath={`url(#${clipPathId})`}>
          <motion.circle
            initial={false}
            animate={{ r: isDark ? 10 : 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            cx="16"
            cy="16"
            r="8"
          />
          <motion.g
            initial={false}
            animate={{
              rotate: isDark ? -100 : 0,
              scale: isDark ? 0.5 : 1,
              opacity: isDark ? 0 : 1,
            }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            stroke="currentColor"
            strokeWidth="1.5"
            opacity="1"
          >
            <path d="M16 5.5v-4" />
            <path d="M16 30.5v-4" />
            <path d="M1.5 16h4" />
            <path d="M26.5 16h4" />
            <path d="m23.4 8.6 2.8-2.8" />
            <path d="m5.7 26.3 2.9-2.9" />
            <path d="m5.8 5.8 2.8 2.8" />
            <path d="m23.4 23.4 2.9 2.9" />
          </motion.g>
        </g>
      </svg>
    </button>
  )
}
