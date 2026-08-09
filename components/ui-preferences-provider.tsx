'use client'

import * as React from 'react'
import { MotionConfig } from 'motion/react'

type UiPreferencesContextValue = {
  animationsDisabled: boolean
  glowDisabled: boolean
  setAnimationsDisabled: (disabled: boolean) => void
  setGlowDisabled: (disabled: boolean) => void
}

const ANIMATIONS_STORAGE_KEY = 'portfolio:ui:disable-animations'
const GLOW_STORAGE_KEY = 'portfolio:ui:disable-glow'
const UiPreferencesContext =
  React.createContext<UiPreferencesContextValue | null>(null)

function getStoredAnimationsDisabled() {
  if (typeof window === 'undefined') return false

  return window.localStorage.getItem(ANIMATIONS_STORAGE_KEY) === 'true'
}

function getStoredGlowDisabled() {
  if (typeof window === 'undefined') return false

  return window.localStorage.getItem(GLOW_STORAGE_KEY) === 'true'
}

function applyAnimationsDisabled(disabled: boolean) {
  document.documentElement.dataset.animationsDisabled = disabled
    ? 'true'
    : 'false'
}

function applyGlowDisabled(disabled: boolean) {
  document.documentElement.dataset.glowDisabled = disabled ? 'true' : 'false'
}

export function UiPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [animationsDisabled, setAnimationsDisabledState] = React.useState(
    getStoredAnimationsDisabled,
  )
  const [glowDisabled, setGlowDisabledState] = React.useState(
    getStoredGlowDisabled,
  )

  React.useLayoutEffect(() => {
    applyAnimationsDisabled(animationsDisabled)
  }, [animationsDisabled])

  React.useLayoutEffect(() => {
    applyGlowDisabled(glowDisabled)
  }, [glowDisabled])

  const setAnimationsDisabled = React.useCallback((disabled: boolean) => {
    window.localStorage.setItem(ANIMATIONS_STORAGE_KEY, String(disabled))
    setAnimationsDisabledState(disabled)
    applyAnimationsDisabled(disabled)
  }, [])

  const setGlowDisabled = React.useCallback((disabled: boolean) => {
    window.localStorage.setItem(GLOW_STORAGE_KEY, String(disabled))
    setGlowDisabledState(disabled)
    applyGlowDisabled(disabled)
  }, [])

  const value = React.useMemo(
    () => ({
      animationsDisabled,
      glowDisabled,
      setAnimationsDisabled,
      setGlowDisabled,
    }),
    [
      animationsDisabled,
      glowDisabled,
      setAnimationsDisabled,
      setGlowDisabled,
    ],
  )

  return (
    <UiPreferencesContext.Provider value={value}>
      <MotionConfig reducedMotion={animationsDisabled ? 'always' : 'user'}>
        {children}
      </MotionConfig>
    </UiPreferencesContext.Provider>
  )
}

export function useUiPreferences() {
  const context = React.useContext(UiPreferencesContext)

  if (!context) {
    throw new Error(
      'useUiPreferences must be used within UiPreferencesProvider',
    )
  }

  return context
}
