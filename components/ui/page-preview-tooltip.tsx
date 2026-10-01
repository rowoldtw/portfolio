'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
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
  animatePosition: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  onReviewSelect?: (collection: (typeof REVIEW_PREVIEWS)[number]['id']) => void
}

export function PagePreviewTooltip({
  preview,
  x,
  animatePosition,
  onMouseEnter,
  onMouseLeave,
  onReviewSelect,
}: PagePreviewTooltipProps) {
  const [reviewsExpanded, setReviewsExpanded] = useState(false)
  const [readyReviews, setReadyReviews] = useState<string[]>([])
  const reviewsActive = preview?.id === 'reviews'
  const reviewsVisible =
    reviewsActive && readyReviews.length === REVIEW_PREVIEWS.length

  return (
    <>
      <motion.div
        aria-hidden={!reviewsVisible}
        inert={!reviewsVisible}
        className="absolute bottom-full left-0 z-50 origin-bottom pb-5"
        style={{ pointerEvents: reviewsVisible ? 'auto' : 'none' }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => {
          setReviewsExpanded(false)
          onMouseLeave?.()
        }}
        initial={{ opacity: 0, x }}
        animate={
          reviewsVisible
            ? { x, opacity: 1, visibility: 'visible' }
            : { x, opacity: 0, visibility: 'hidden' }
        }
        transition={{
          type: 'spring',
          bounce: 0,
          duration: 0.2,
          x: { type: 'spring', bounce: 0, duration: animatePosition ? 0.2 : 0 },
        }}
      >
        <div className="-translate-x-1/2">
          <ReviewPreviewStack
            expanded={reviewsExpanded}
            onExpand={() => setReviewsExpanded(true)}
            onReviewSelect={onReviewSelect}
            onReady={(id) =>
              setReadyReviews((ready) =>
                ready.includes(id) ? ready : [...ready, id],
              )
            }
          />
        </div>
      </motion.div>
      {PAGE_PREVIEWS.map((item) => (
        <PersistentPagePreview
          key={item.id}
          id={item.id}
          active={preview?.id === item.id}
          href={item.href}
          label={item.label}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          x={x}
          animatePosition={animatePosition}
        />
      ))}
    </>
  )
}

function PersistentPagePreview({
  id,
  active,
  href,
  label,
  onMouseEnter,
  onMouseLeave,
  x,
  animatePosition,
}: {
  id: (typeof PAGE_PREVIEWS)[number]['id']
  active: boolean
  href: string
  label: string
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  x: number
  animatePosition: boolean
}) {
  const [ready, setReady] = useState(false)
  const visible = active && ready
  return (
    <motion.div
      aria-hidden={!visible}
      inert={!visible}
      className="absolute bottom-full left-0 z-50 origin-bottom pb-5"
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      initial={{ opacity: 0, x }}
      animate={
        visible
          ? { x, opacity: 1, visibility: 'visible' }
          : { x, opacity: 0, visibility: 'hidden' }
      }
      transition={{
        type: 'spring',
        bounce: 0,
        duration: 0.2,
        x: { type: 'spring', bounce: 0, duration: animatePosition ? 0.2 : 0 },
      }}
    >
      <div className="group relative aspect-video w-52 -translate-x-1/2 rounded-xl">
        <div className="relative z-10 aspect-video overflow-hidden rounded-xl border-2 border-[#E8E6E3] bg-[#f4f4f4] shadow-xl transition-transform duration-200 group-hover:-translate-y-0.5 dark:border-white/15 dark:bg-[#181818]">
          <PreviewFrame id={id} onReady={() => setReady(true)} />
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
  onReady,
}: {
  expanded: boolean
  onExpand: () => void
  onReviewSelect?: (collection: (typeof REVIEW_PREVIEWS)[number]['id']) => void
  onReady: (id: string) => void
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
            <div className="relative h-full overflow-hidden rounded-xl border-2 border-[#E8E6E3] bg-[#f4f4f4] shadow-xl transition-transform duration-200 hover:-translate-y-0.5 dark:border-white/15 dark:bg-[#181818]">
              <PreviewFrame id={item.id} onReady={() => onReady(item.id)} />
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

function PreviewFrame({
  id,
  onReady,
}: {
  id:
    | (typeof PAGE_PREVIEWS)[number]['id']
    | (typeof REVIEW_PREVIEWS)[number]['id']
  onReady: () => void
}) {
  const { resolvedTheme } = useTheme()

  return (
    <Image
      src={`/previews/${id}-${resolvedTheme}.png`}
      alt=""
      width={416}
      height={234}
      unoptimized
      onLoad={onReady}
      className="block h-full w-full object-cover"
    />
  )
}
