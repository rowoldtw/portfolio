'use client'

import * as React from 'react'
import SplitReveal from '@/components/animata/preloader/split-reveal'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const PRELOADER_STORAGE_KEY = 'portfolio:intro-preloader-seen'
export const PRELOADER_REPLAY_EVENT = 'portfolio:replay-intro-preloader'

export function SitePreloader() {
  const prefersReducedMotion = usePrefersReducedMotion()
  const [active, setActive] = React.useState(true)
  const [runId, setRunId] = React.useState(0)

  React.useEffect(() => {
    const shouldShow =
      document.documentElement.dataset.showIntroPreloader === 'true'

    if (!shouldShow) {
      const frame = window.requestAnimationFrame(() => setActive(false))
      return () => window.cancelAnimationFrame(frame)
    }
  }, [])

  React.useEffect(() => {
    const replay = () => {
      document.documentElement.dataset.showIntroPreloader = 'true'
      setRunId((current) => current + 1)
      setActive(true)
    }

    window.addEventListener(PRELOADER_REPLAY_EVENT, replay)
    return () => window.removeEventListener(PRELOADER_REPLAY_EVENT, replay)
  }, [])

  const finish = React.useCallback(() => {
    window.localStorage.setItem(PRELOADER_STORAGE_KEY, 'true')
    document.documentElement.dataset.showIntroPreloader = 'false'
    setActive(false)
  }, [])

  if (!active) return null

  return (
    <SplitReveal
      key={runId}
      ready
      progress={{ loaded: 1, total: 1 }}
      backgroundColor="#52525b"
      foregroundColor="#fafafa"
      revealDuration={prefersReducedMotion ? 0.001 : 1.1}
      progressFadeMs={prefersReducedMotion ? 0 : 250}
      holdMs={prefersReducedMotion ? 0 : 600}
      lockScroll
      onComplete={finish}
    >
      <SplitReveal.Overlay
        data-site-preloader
        role="status"
        aria-label="Loading portfolio"
      >
        <SplitReveal.Shutter className="site-preloader-shutter" side="top" />
        <SplitReveal.Shutter className="site-preloader-shutter" side="bottom" />
        <SplitReveal.Progress />
      </SplitReveal.Overlay>
    </SplitReveal>
  )
}
