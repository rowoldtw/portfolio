'use client'

import { cn } from '@/lib/utils'

type SectionNavSection = {
  id: string
  label: string
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
        'fixed right-4 top-1/2 z-50 -translate-y-1/2',
        className
      )}
    >
      <div className="flex flex-col items-end gap-2">
        <ul className="flex flex-col gap-2">
        {sections.map((section) => {
          const isActive = section.id === activeId

          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onSelect(section.id)}
                aria-label={`Go to ${section.label} section`}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'group relative flex h-8 w-8 items-center justify-center rounded-full text-xs text-zinc-500 transition-colors hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:text-zinc-400 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500/60',
                  isActive && 'text-zinc-950 dark:text-zinc-50'
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full bg-zinc-300 transition-transform group-hover:scale-110 dark:bg-zinc-700',
                    isActive && 'bg-zinc-950 dark:bg-zinc-50'
                  )}
                />
                <span
                  className={cn(
                    'pointer-events-none absolute right-full mr-2 inline-flex items-center whitespace-nowrap rounded-full bg-white/70 px-2 py-1 text-xs text-zinc-700 shadow-sm ring-1 ring-zinc-200/60 backdrop-blur transition-all duration-150',
                    'opacity-0 translate-x-1',
                    'group-hover:opacity-100 group-hover:translate-x-0',
                    'group-focus-visible:opacity-100 group-focus-visible:translate-x-0',
                    'dark:bg-zinc-950/60 dark:text-zinc-200 dark:ring-zinc-800/60'
                  )}
                >
                  {section.label}
                </span>
              </button>
            </li>
          )
        })}
        </ul>
      </div>
    </nav>
  )
}

