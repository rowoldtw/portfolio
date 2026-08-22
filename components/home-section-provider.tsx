'use client'

import * as React from 'react'

type HomeSectionContextValue = {
  activeHomeSectionId: string
  setActiveHomeSectionId: (id: string) => void
  isHomeSectionReady: boolean
}

const HOME_LAST_SECTION_STORAGE_KEY = 'portfolio:home:last-section-id'
const HOME_SECTION_IDS = new Set([
  'home',
  'projects',
  'experience',
  'skills',
  'connect',
])
const HomeSectionContext = React.createContext<HomeSectionContextValue | null>(
  null,
)

function getInitialHomeSectionId() {
  const hashId = window.location.hash.replace('#', '')
  if (HOME_SECTION_IDS.has(hashId)) return hashId

  try {
    const storedId = window.sessionStorage.getItem(
      HOME_LAST_SECTION_STORAGE_KEY,
    )
    return storedId && HOME_SECTION_IDS.has(storedId) ? storedId : 'home'
  } catch {
    return 'home'
  }
}

export function HomeSectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [activeHomeSectionId, setActiveHomeSectionId] = React.useState('home')
  const [isHomeSectionReady, setIsHomeSectionReady] = React.useState(false)

  React.useLayoutEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setActiveHomeSectionId(getInitialHomeSectionId())
      setIsHomeSectionReady(true)
    })

    return () => window.cancelAnimationFrame(frame)
  }, [])

  const value = React.useMemo(
    () => ({ activeHomeSectionId, setActiveHomeSectionId, isHomeSectionReady }),
    [activeHomeSectionId, isHomeSectionReady],
  )

  return (
    <HomeSectionContext.Provider value={value}>
      {children}
    </HomeSectionContext.Provider>
  )
}

export function useHomeSection() {
  const context = React.useContext(HomeSectionContext)

  if (!context) {
    throw new Error('useHomeSection must be used within HomeSectionProvider')
  }

  return context
}
