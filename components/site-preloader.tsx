'use client'

import * as React from 'react'
import { motion } from 'motion/react'
import {
  BrainCircuit,
  Bot,
  Brain,
  AudioLines,
  Swords,
  Clapperboard,
  Mountain,
} from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const PRELOADER_STORAGE_KEY = 'portfolio:intro-preloader-seen'
export const PRELOADER_REPLAY_EVENT = 'portfolio:replay-intro-preloader'
const WORDS = [
  { text: 'hi!', icon: null },
  { text: "i'm woody :)", icon: null },
  { text: 'i like...', icon: null },
  { text: 'machine learning', icon: BrainCircuit },
  { text: 'ai', icon: Bot },
  { text: 'brains', icon: Brain },
  { text: 'hyperpop', icon: AudioLines },
  { text: 'swords', icon: Swords },
  { text: 'scary movies', icon: Clapperboard },
  { text: 'and climbing', icon: Mountain },
  { text: 'i hope u enjoy my site!', icon: null },
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
    const duration = reducedMotion
      ? 180
      : word === 0
        ? 500
        : word === WORDS.length - 1
          ? 350
          : Math.max(220, WORDS[word].text.length * 30)
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
  const Icon = WORDS[word].icon

  return (
    <motion.div
      role="main"
      aria-label="Portfolio introduction"
      data-site-preloader=""
      data-cursor-exclude=""
      className="fixed inset-0 z-[100] flex items-center justify-center bg-white text-zinc-950 dark:bg-[#080808] dark:text-zinc-100"
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
          className="flex max-w-[calc(100vw-3rem)] items-center justify-center gap-3 text-center text-[clamp(1.25rem,5.5vw,2.625rem)] font-normal tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {Icon && (
            <Icon
              key={WORDS[word].text}
              aria-hidden="true"
              data-preloader-icon=""
              strokeWidth={1.5}
              className="size-[1em] shrink-0"
            />
          )}
          <span>{WORDS[word].text}</span>
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
