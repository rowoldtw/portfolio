'use client'

import { useSyncExternalStore } from 'react'
import { TextEffect } from '@/components/ui/text-effect'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

const DETAILS = [
  'Machine Learning Engineer',
  'Last update: Q3 2026',
  'Three.js refresh: Q4 2026',
] as const

function subscribeToPreloader(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-show-intro-preloader'],
  })
  return () => observer.disconnect()
}

function getPreloaderComplete() {
  return document.documentElement.dataset.showIntroPreloader !== 'true'
}

export function LandingHeader() {
  const preloaderComplete = useSyncExternalStore(
    subscribeToPreloader,
    getPreloaderComplete,
    () => true,
  )
  const prefersReducedMotion = usePrefersReducedMotion()

  return (
    <header className="text-foreground relative z-10 flex w-[min(92vw,64rem)] flex-col items-start px-5 py-7 sm:px-10 sm:py-10">
      {prefersReducedMotion ? (
        <h1 className="w-full text-[clamp(4rem,10vw,8.5rem)] leading-[0.82] font-semibold tracking-[-0.075em]">
          <span className="block">Woodrow</span>
          <span className="block">Rowoldt</span>
        </h1>
      ) : (
        <TextEffect
          as="h1"
          per="line"
          preset="fade-in-blur"
          trigger={preloaderComplete}
          speedReveal={1.25}
          speedSegment={0.8}
          className="w-full text-[clamp(4rem,10vw,8.5rem)] leading-[0.82] font-semibold tracking-[-0.075em]"
        >
          {'Woodrow\nRowoldt'}
        </TextEffect>
      )}
      <div className="mt-7 w-full pl-[0.18em] text-xs leading-relaxed text-zinc-500 uppercase sm:mt-10 sm:text-sm dark:text-zinc-400">
        {DETAILS.map((detail, index) =>
          prefersReducedMotion ? (
            <p key={detail}>{detail}</p>
          ) : (
            <TextEffect
              key={detail}
              as="p"
              per="char"
              preset="fade"
              trigger={preloaderComplete}
              delay={0.35 + index * 0.1}
              speedReveal={1.8}
            >
              {detail}
            </TextEffect>
          ),
        )}
      </div>
    </header>
  )
}
