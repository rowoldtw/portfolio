'use client'

import { motion } from 'motion/react'
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
  onSelect: (id: string) => void
  className?: string
}

export function SectionNav({
  sections,
  activeId,
  onSelect,
  className,
}: SectionNavProps) {
  return (
    <nav
      aria-label="Section navigation"
      className={cn(
        'fixed top-1/2 right-4 z-50 -translate-y-1/2 rounded-full border border-zinc-200/60 bg-white/60 p-1 shadow-lg shadow-zinc-900/10 backdrop-blur-md dark:border-zinc-800/60 dark:bg-[#111]/60 dark:shadow-black/40',
        className,
      )}
    >
      <div className="flex flex-col gap-1">
        {sections.map((section) => {
          const isActive = section.id === activeId
          const Icon = section.icon

          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelect(section.id)}
              aria-label={`Go to ${section.label} section`}
              aria-current={isActive ? 'true' : undefined}
              className={cn(
                'group relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 transition-colors duration-200 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500/60',
                isActive && 'text-zinc-950 dark:text-zinc-50',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="section-nav-active"
                  className="absolute inset-0 rounded-full bg-zinc-100 dark:bg-zinc-800/80"
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 34,
                    mass: 0.8,
                  }}
                />
              )}
              <Icon
                aria-hidden="true"
                className={cn(
                  'relative z-10 h-4 w-4 transition-transform duration-200 group-hover:scale-105',
                  isActive && 'scale-105',
                )}
              />
              <span
                className={cn(
                  'pointer-events-none absolute right-full mr-2 inline-flex items-center rounded-full bg-white/70 px-2 py-1 text-xs whitespace-nowrap text-zinc-700 shadow-sm ring-1 ring-zinc-200/60 backdrop-blur transition-all duration-150',
                  'translate-x-1 opacity-0',
                  'group-hover:translate-x-0 group-hover:opacity-100',
                  'group-focus-visible:translate-x-0 group-focus-visible:opacity-100',
                  'dark:bg-zinc-950/60 dark:text-zinc-200 dark:ring-zinc-800/60',
                )}
              >
                {section.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
