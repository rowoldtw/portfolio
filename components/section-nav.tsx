'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type SectionNavSection = {
  id: string
  label: string
  icon: LucideIcon
}

type SectionNavProps = {
  sections: SectionNavSection[]
  activeId: string
  activeIndicatorReady?: boolean
  onSelect: (id: string) => void
  className?: string
}

export function SectionNav({
  sections,
  activeId,
  activeIndicatorReady = true,
  onSelect,
  className,
}: SectionNavProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  )

  return (
    <div className="fixed top-1/2 right-[max(1rem,env(safe-area-inset-right))] z-50 -translate-y-1/2">
      <nav
        aria-label="Section navigation"
        data-active-section-ready={activeIndicatorReady}
        className={cn(
          'floating-nav-chrome relative overflow-visible rounded-full border border-white/70 bg-[#f4f4f4]/50 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-[#181818]/75',
          className,
        )}
      >
        <div className="relative flex flex-col gap-1">
          <AnimatePresence initial={false}>
            {hoveredIndex !== null && sections[hoveredIndex] && (
              <motion.div
                id="section-nav-tooltip"
                role="tooltip"
                className="pointer-events-none absolute top-0 right-full mr-2 flex h-7 items-center rounded-full bg-white px-2.5 text-xs whitespace-nowrap text-zinc-950 shadow-sm ring-1 ring-zinc-200/70 dark:bg-zinc-950 dark:text-zinc-50 dark:ring-zinc-800/70"
                initial={{
                  clipPath: 'inset(0 0 0 100% round 999px)',
                  opacity: 0,
                  x: 4,
                  y: hoveredIndex * 40 + 4,
                }}
                animate={{
                  clipPath: 'inset(0 0 0 0 round 999px)',
                  opacity: 1,
                  x: 0,
                  y: hoveredIndex * 40 + 4,
                }}
                exit={{
                  clipPath: 'inset(0 0 0 100% round 999px)',
                  opacity: 0,
                  x: 4,
                }}
                transition={{
                  clipPath: { duration: 0.2, ease: 'easeOut' },
                  opacity: { duration: 0.15 },
                  x: { duration: 0.15, ease: 'easeOut' },
                  y: { type: 'spring', bounce: 0, duration: 0.2 },
                }}
              >
                {sections[hoveredIndex].label}
              </motion.div>
            )}
          </AnimatePresence>
          {activeIndicatorReady ? (
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 size-9 rounded-full bg-white shadow-sm dark:bg-zinc-800"
              initial={false}
              animate={{ y: activeIndex * 40 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.2 }}
            />
          ) : (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-0 left-0 size-9 rounded-full bg-white shadow-sm dark:bg-zinc-800"
              style={{
                transform:
                  'translateY(calc(var(--initial-home-section-index, 0) * 40px))',
              }}
            />
          )}
          {sections.map((section, index) => {
            const isActive = section.id === activeId
            const isRenderedActive = activeIndicatorReady && isActive
            const Icon = section.icon

            return (
              <button
                key={section.id}
                type="button"
                data-section-nav-id={section.id}
                onClick={() => onSelect(section.id)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(index)}
                onBlur={() => setHoveredIndex(null)}
                aria-label={`Go to ${section.label} section`}
                aria-describedby={
                  hoveredIndex === index ? 'section-nav-tooltip' : undefined
                }
                aria-current={isRenderedActive ? 'true' : undefined}
                className={cn(
                  'group relative flex size-9 items-center justify-center rounded-full text-zinc-500 transition-colors duration-200 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500/60',
                  isRenderedActive && 'text-zinc-950 dark:text-zinc-50',
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    'relative z-10 size-4 transition-transform duration-200 group-hover:scale-105',
                    isRenderedActive && 'scale-105',
                  )}
                />
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
