'use client'
import { TextEffect } from '@/components/ui/text-effect'
import Link from 'next/link'

export function Header() {
  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <Link
          href="/"
          className="group relative inline-flex font-medium text-black transition-colors hover:text-zinc-600 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:text-white dark:hover:text-zinc-300 dark:focus-visible:ring-zinc-500/60"
        >
          Woodrow Rowoldt
          <span className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-zinc-500 transition-transform duration-200 group-hover:scale-x-100 dark:bg-zinc-400" />
        </Link>
        <TextEffect
          as="p"
          preset="fade"
          per="char"
          className="text-zinc-600 dark:text-zinc-500"
          delay={0.5}
        >
          Machine Learning Engineer
        </TextEffect>
        <p className="mt-1 text-xs text-zinc-500 tabular-nums dark:text-zinc-600">
          Last update: Q3 2026
        </p>
      </div>
    </header>
  )
}
