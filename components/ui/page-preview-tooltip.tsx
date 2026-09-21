'use client'

import Link from 'next/link'
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { motion } from 'motion/react'
import { useTheme } from '@/components/theme-provider'

const REVIEW_PREVIEWS = [
  { id: 'hardware', label: 'Hardware' },
  { id: 'software', label: 'Software' },
  { id: 'albums', label: 'Albums' },
] as const

const PAGE_PREVIEWS = [
  { id: 'professional', label: 'Professional', href: '/' },
  { id: 'projects', label: 'Projects', href: '/projects' },
] as const

export type PagePreview = {
  href: string
  id: string
  label: string
}

type PagePreviewTooltipProps = {
  preview: PagePreview | null
  x: number
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onReviewSelect?: (collection: (typeof REVIEW_PREVIEWS)[number]['id']) => void
}

function subscribeToTopWindow() {
  return () => {}
}

function getIsTopWindow() {
  return window.self === window.top
}

export function PagePreviewTooltip({
  preview,
  x,
  onMouseEnter,
  onMouseLeave,
  onReviewSelect,
}: PagePreviewTooltipProps) {
  const [reviewsExpanded, setReviewsExpanded] = useState(false)
  const isTopWindow = useSyncExternalStore(
    subscribeToTopWindow,
    getIsTopWindow,
    () => false,
  )
  const reviewsActive = preview?.id === 'reviews'

  return (
    <>
      {isTopWindow && (
        <>
          <motion.div
            aria-hidden={!reviewsActive}
            inert={!reviewsActive}
            className="absolute bottom-full left-0 z-50 origin-bottom pb-5"
            style={{ pointerEvents: reviewsActive ? 'auto' : 'none' }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={() => {
              setReviewsExpanded(false)
              onMouseLeave?.()
            }}
            initial={false}
            animate={
              reviewsActive
                ? { opacity: 1, visibility: 'visible', x, y: 0 }
                : { opacity: 0, visibility: 'hidden', x, y: 0 }
            }
            transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
          >
            <div className="-translate-x-1/2">
              <ReviewPreviewStack
                expanded={reviewsExpanded}
                onExpand={() => setReviewsExpanded(true)}
                onReviewSelect={onReviewSelect}
              />
            </div>
          </motion.div>
          {PAGE_PREVIEWS.map((item) => (
            <PersistentPagePreview
              key={item.id}
              active={preview?.id === item.id}
              href={item.href}
              label={item.label}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              x={x}
            />
          ))}
        </>
      )}
    </>
  )
}

function PersistentPagePreview({
  active,
  href,
  label,
  onMouseEnter,
  onMouseLeave,
  x,
}: {
  active: boolean
  href: string
  label: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  x: number
}) {
  return (
    <motion.div
      aria-hidden={!active}
      inert={!active}
      className="absolute bottom-full left-0 z-50 origin-bottom pb-5"
      style={{ pointerEvents: active ? 'auto' : 'none' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={false}
      animate={
        active
          ? { opacity: 1, visibility: 'visible', x, y: 0 }
          : { opacity: 0, visibility: 'hidden', x, y: 0 }
      }
      transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
    >
      <div className="group relative aspect-video w-52 -translate-x-1/2 rounded-xl">
        <div className="relative z-10 aspect-video overflow-hidden rounded-xl border-2 border-white/80 bg-[#f4f4f4] p-0.5 shadow-xl transition-transform duration-200 group-hover:-translate-y-0.5 dark:border-white/15 dark:bg-[#181818]">
          <div className="absolute inset-0">
            <PreviewFrame href={href} label={label} />
          </div>
        </div>
        <Link
          href={href}
          aria-label={`Open ${label}`}
          className="absolute inset-0 z-20 rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-400/70 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-zinc-500/70"
        />
      </div>
    </motion.div>
  )
}

function ReviewPreviewStack({
  expanded,
  onExpand,
  onReviewSelect,
}: {
  expanded: boolean
  onExpand: () => void
  onReviewSelect?: (collection: (typeof REVIEW_PREVIEWS)[number]['id']) => void
}) {
  return (
    <div className="relative h-[20.5rem] w-56">
      {REVIEW_PREVIEWS.map((item, index) => {
        const stacked = { x: index * 6, y: index * -6 }
        const unstacked = { x: index * 8, y: index * -104 }

        return (
          <motion.div
            key={item.id}
            data-review-preview={item.id}
            className="absolute inset-x-2 bottom-0 aspect-video"
            style={{ zIndex: 30 - index * 10 }}
            animate={expanded ? unstacked : stacked}
            transition={{ type: 'spring', bounce: 0.16, duration: 0.32 }}
            onMouseEnter={index === 0 ? onExpand : undefined}
            onFocus={index === 0 ? onExpand : undefined}
          >
            <div className="relative h-full overflow-hidden rounded-xl border-2 border-white/80 bg-[#f4f4f4] p-0.5 shadow-xl transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/15 dark:bg-[#181818]">
              <PreviewFrame
                href={`/reviews?collection=${item.id}`}
                label={item.label}
              />
              <Link
                href={`/reviews?collection=${item.id}`}
                aria-label={`Open ${item.label} reviews`}
                onClick={() => onReviewSelect?.(item.id)}
                className="absolute inset-0 z-10 rounded-xl focus-visible:ring-2 focus-visible:ring-zinc-400/70 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-zinc-500/70"
              />
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function PreviewFrame({ href, label }: { href: string; label: string }) {
  const { resolvedTheme } = useTheme()
  const frameRef = useRef<HTMLIFrameElement>(null)

  const syncFrameTheme = () => {
    const root = frameRef.current?.contentDocument?.documentElement
    if (!root) return

    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.classList.toggle('light', resolvedTheme === 'light')
    root.style.colorScheme = resolvedTheme
  }

  useLayoutEffect(syncFrameTheme, [resolvedTheme])

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-[#fafafa] dark:bg-[#111]">
      <iframe
        ref={frameRef}
        src={href}
        title={`${label} page preview`}
        tabIndex={-1}
        loading="eager"
        onLoad={syncFrameTheme}
        className="pointer-events-none h-[720px] w-[1280px] origin-top-left scale-[0.15625] border-0"
      />
    </div>
  )
}
