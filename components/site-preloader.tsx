'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const PRELOADER_STORAGE_KEY = 'portfolio:intro-preloader-seen'
export const PRELOADER_REPLAY_EVENT = 'portfolio:replay-intro-preloader'
const WORDS = [
  'Hello',
  'Bonjour',
  'Ciao',
  'Olá',
  'やあ',
  'Hallå',
  'Hallo',
  'Hello',
]

export function SitePreloader() {
  const [active, setActive] = React.useState(true)
  const [runId, setRunId] = React.useState(0)

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
    try {
      window.localStorage.setItem(PRELOADER_STORAGE_KEY, 'true')
    } catch {}
    document.documentElement.dataset.showIntroPreloader = 'false'
    setActive(false)
  }, [])

  return active ? <WordsPreloader key={runId} onComplete={finish} /> : null
}

// Inspired by Skiper UI's words preloader: https://skiper-ui.com/v1/skiper8
function WordsPreloader({ onComplete }: { onComplete: () => void }) {
  const reducedMotion = usePrefersReducedMotion()
  const [word, setWord] = React.useState(0)
  const [leaving, setLeaving] = React.useState(false)

  React.useEffect(() => {
    if (document.documentElement.dataset.showIntroPreloader !== 'true') {
      const frame = requestAnimationFrame(onComplete)
      return () => cancelAnimationFrame(frame)
    }
    const previousOverflow = document.body.style.overflow
    const previousFocus = document.activeElement
    const backgrounds = Array.from(
      document.querySelectorAll<HTMLElement>('[data-site-content]'),
    )
    const previousInert = backgrounds.map((element) => element.inert)
    backgrounds.forEach((element) => {
      element.inert = true
    })
    document.body.style.overflow = 'hidden'
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onComplete()
    }
    window.addEventListener('keydown', key)
    return () => {
      document.body.style.overflow = previousOverflow
      backgrounds.forEach((element, index) => {
        element.inert = previousInert[index]
      })
      window.removeEventListener('keydown', key)
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected)
        previousFocus.focus({ preventScroll: true })
    }
  }, [onComplete])

  React.useEffect(() => {
    if (document.documentElement.dataset.showIntroPreloader !== 'true') return
    const duration = reducedMotion ? 180 : word === 0 ? 650 : 160
    const timer = window.setTimeout(() => {
      if (reducedMotion || word === WORDS.length - 1) setLeaving(true)
      else setWord((current) => current + 1)
    }, duration)
    return () => window.clearTimeout(timer)
  }, [word, reducedMotion])

  return (
    <PreloaderCurtain
      word={word}
      leaving={leaving}
      reducedMotion={reducedMotion}
      onComplete={onComplete}
    />
  )
}

function PreloaderCurtain({
  word,
  leaving,
  reducedMotion,
  onComplete,
}: {
  word: number
  leaving: boolean
  reducedMotion: boolean
  onComplete: () => void
}) {
  return (
    <motion.div
      role="main"
      aria-label="Portfolio introduction"
      data-site-preloader=""
      data-cursor-exclude=""
      className="fixed inset-0 z-[90] flex items-center justify-center bg-white text-zinc-950 dark:bg-[#080808] dark:text-zinc-100"
      initial={false}
      variants={{
        enter: { opacity: 1, y: 0 },
        exit: reducedMotion ? { opacity: 0, y: 0 } : { opacity: 1, y: '-100%' },
      }}
      animate={leaving ? 'exit' : 'enter'}
      transition={{
        duration: reducedMotion ? 0.15 : 0.8,
        ease: [0.76, 0, 0.24, 1],
      }}
      onAnimationComplete={(definition) => {
        if (definition === 'exit') onComplete()
      }}
    >
      <div role="status" aria-label="Loading portfolio">
        <motion.p
          aria-hidden="true"
          className="flex items-center gap-4 text-3xl font-normal tracking-tight sm:text-[42px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          <span className="size-2 rounded-full bg-current" />
          {WORDS[word]}
        </motion.p>
      </div>
      {!reducedMotion && (
        <svg
          aria-hidden="true"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          className="pointer-events-none absolute top-[calc(100%-1px)] left-0 h-[200px] w-full fill-white dark:fill-[#080808]"
        >
          <motion.path
            initial={false}
            animate={{
              d: leaving
                ? 'M0 0 L1000 0 Q500 0 0 0 Z'
                : 'M0 0 L1000 0 Q500 400 0 0 Z',
            }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          />
        </svg>
      )}
    </motion.div>
  )
}
