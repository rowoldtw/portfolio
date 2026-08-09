'use client'

import * as React from 'react'

export type Theme = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const THEME_STORAGE_KEY = 'theme'
const LIGHT_BACKGROUND_COLOR = '#fafafa'
const DARK_BACKGROUND_COLOR = '#111'
const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light'

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  return stored === 'light' || stored === 'dark' || stored === 'system'
    ? stored
    : 'system'
}

function applyTheme(theme: Theme, resolvedTheme: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', resolvedTheme === 'dark')
  document.documentElement.classList.toggle('light', resolvedTheme === 'light')
  document.documentElement.dataset.themeChoice = theme
  document.documentElement.style.backgroundColor =
    resolvedTheme === 'dark' ? DARK_BACKGROUND_COLOR : LIGHT_BACKGROUND_COLOR
  document.documentElement.style.colorScheme = resolvedTheme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>('system')
  const [systemTheme, setSystemTheme] = React.useState<ResolvedTheme>('light')

  const resolvedTheme = theme === 'system' ? systemTheme : theme

  React.useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const nextTheme = getStoredTheme()
      const nextSystemTheme = getSystemTheme()
      const nextResolvedTheme =
        nextTheme === 'system' ? nextSystemTheme : nextTheme

      setThemeState(nextTheme)
      setSystemTheme(nextSystemTheme)
      applyTheme(nextTheme, nextResolvedTheme)
      document.documentElement.dataset.themeReady = 'true'
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  React.useLayoutEffect(() => {
    applyTheme(theme, resolvedTheme)
  }, [theme, resolvedTheme])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      setSystemTheme(getSystemTheme())
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const setTheme = React.useCallback((nextTheme: Theme) => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
    setThemeState(nextTheme)
    const nextSystemTheme = getSystemTheme()
    const nextResolvedTheme =
      nextTheme === 'system' ? nextSystemTheme : nextTheme

    setSystemTheme(nextSystemTheme)
    applyTheme(nextTheme, nextResolvedTheme)
  }, [])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }

  return context
}
