'use client'

import * as React from 'react'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { Theme, useTheme } from '@/components/theme-provider'

import { cn } from '@/lib/utils'

type AnimatedThemeTogglerProps = {
  className?: string
}

function getStoredThemeChoice(): Theme {
  if (typeof window === 'undefined') return 'system'

  const storedTheme = window.localStorage.getItem('theme')
  return storedTheme === 'system' ||
    storedTheme === 'light' ||
    storedTheme === 'dark'
    ? storedTheme
    : 'system'
}

export function AnimatedThemeToggler({
  className,
}: AnimatedThemeTogglerProps) {
  const { setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] =
    React.useState<Theme>(getStoredThemeChoice)
  const themeOptions = [
    { id: 'system', label: 'System theme', icon: MonitorIcon, className: 'theme-option-system' },
    { id: 'light', label: 'Light theme', icon: SunIcon, className: 'theme-option-light' },
    { id: 'dark', label: 'Dark theme', icon: MoonIcon, className: 'theme-option-dark' },
  ] as const
  const themeIds = new Set<string>(themeOptions.map((option) => option.id))

  function isTheme(value: string): value is Theme {
    return themeIds.has(value)
  }

  React.useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSelectedTheme(getStoredThemeChoice())
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      aria-label="Theme"
      role="group"
      className={cn(
        'theme-selector relative grid h-8 grid-cols-3 items-center rounded-full border border-zinc-200/60 bg-white/60 p-0.5 backdrop-blur-md transition-colors dark:border-zinc-800/60 dark:bg-[#111]/60',
        className,
      )}
    >
      <span className="theme-selector-pill absolute top-0.5 left-0.5 h-7 w-7 rounded-full bg-zinc-100 transition-[transform,background-color] dark:bg-zinc-800/80" />
      {themeOptions.map((option) => {
        const Icon = option.icon
        const isActive = selectedTheme === option.id

        return (
          <button
            key={option.id}
            type="button"
            data-id={option.id}
            data-checked={isActive}
            aria-label={option.label}
            aria-pressed={isActive}
            title={option.label}
            onClick={() => {
              if (!isTheme(option.id)) return
              setSelectedTheme(option.id)
              setTheme(option.id)
            }}
            className={cn(
              'relative z-10 flex h-7 w-7 items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:focus-visible:ring-zinc-500/60',
              option.className,
              'text-zinc-500 hover:text-zinc-950 data-[checked=true]:text-zinc-950 dark:hover:text-zinc-100 dark:data-[checked=true]:text-zinc-50',
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
