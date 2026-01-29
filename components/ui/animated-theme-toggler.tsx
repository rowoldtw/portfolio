'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { cn } from '@/lib/utils'

type AnimatedThemeTogglerProps = {
  className?: string
  /**
   * Duration of the theme transition animation in milliseconds.
   * Defaults to 400ms.
   */
  duration?: number
}

/**
 * Magic UI-inspired animated theme toggler.
 * Docs: https://magicui.design/docs/components/animated-theme-toggler
 */
export function AnimatedThemeToggler({
  className,
  duration = 400,
}: AnimatedThemeTogglerProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = resolvedTheme === 'dark'
  const seconds = duration / 1000

  return (
    <motion.button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      initial={false}
      className={cn(
        'relative inline-flex h-8 w-14 items-center rounded-full border border-zinc-200/60 bg-white/60 backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:border-zinc-800/60 dark:bg-[#121212]/60 dark:focus-visible:ring-zinc-500/60',
        className,
      )}
    >
      <span className="sr-only">Toggle theme</span>

      <motion.span
        className="pointer-events-none absolute left-[3px] top-[3px] flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-zinc-200/60 dark:bg-zinc-950 dark:ring-zinc-800/60"
        animate={{ x: isDark ? 24 : 0 }}
        transition={{ type: 'spring', bounce: 0, duration: seconds }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.65 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.65 }}
              transition={{ duration: seconds, ease: 'easeInOut' }}
              className="text-zinc-200"
            >
              <MoonIcon className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.65 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.65 }}
              transition={{ duration: seconds, ease: 'easeInOut' }}
              className="text-zinc-700"
            >
              <SunIcon className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.span>
    </motion.button>
  )
}

