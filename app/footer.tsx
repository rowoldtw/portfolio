'use client'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { TextLoop } from '@/components/ui/text-loop'
import { cn } from '@/lib/utils'

export function Footer({
  className,
}: {
  className?: string
}) {
  return (
    <footer
      className={cn(
        'mt-24 border-t border-zinc-100 px-0 py-4 dark:border-zinc-800',
        className
      )}
    >
      <div
        className={cn(
          'flex items-center justify-between gap-3'
        )}
      >
        <a
          href="https://github.com/rowoldtw"
          target="_blank"
          rel="noopener noreferrer"
        >
          <TextLoop className="text-xs text-zinc-500">
            <span>© 2026 Woodrow Rowoldt</span>
            <span>ss03</span>
          </TextLoop>
        </a>

        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <AnimatedThemeToggler />
        </div>
      </div>
    </footer>
  )
}
