import type { Metadata } from 'next'
import Link from 'next/link'
import { JOURNAL_ENTRIES } from '@/app/data'

export const metadata: Metadata = {
  title: 'Personal',
  description: 'Personal notes and journal entries from Woodrow Rowoldt.',
}

export default function PersonalPage() {
  return (
    <main className="bg-background min-h-dvh w-full dark:bg-[#111]">
      <div className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col justify-center px-4 py-24">
        <section>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Personal</p>
          <h1 className="mt-2 text-lg font-medium text-balance text-zinc-950 dark:text-zinc-50">
            Notes, interests, and work outside the résumé.
          </h1>
          <p className="mt-3 max-w-md text-pretty text-zinc-600 dark:text-zinc-400">
            This area is still in progress. Journal entries have moved here
            while the rest of the page takes shape.
          </p>
        </section>

        <section className="mt-12" aria-labelledby="journal-heading">
          <h2
            id="journal-heading"
            className="text-lg font-medium text-zinc-950 dark:text-zinc-50"
          >
            Journal
          </h2>
          <div className="mt-3 divide-y divide-zinc-200/70 dark:divide-zinc-800/70">
            {JOURNAL_ENTRIES.map((entry) => (
              <Link
                key={entry.uid}
                href={entry.link}
                className="group flex items-start justify-between gap-6 py-4"
              >
                <span>
                  <span className="block text-zinc-900 transition-colors duration-200 group-hover:text-zinc-500 dark:text-zinc-100 dark:group-hover:text-zinc-400">
                    {entry.title}
                  </span>
                  <span className="mt-1 block text-pretty text-zinc-500 dark:text-zinc-400">
                    {entry.description}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className="mt-0.5 text-zinc-400 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-zinc-600"
                >
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
