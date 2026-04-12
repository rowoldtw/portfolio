import Link from 'next/link'
import { Header } from '@/app/header'
import { Footer } from '@/app/footer'
import { EMAIL } from '@/app/data'

export function WipPlaceholder() {
  return (
    <main className="flex min-h-screen w-full flex-col">
      <div className="mx-auto flex min-h-screen w-full max-w-screen-sm flex-1 flex-col px-4 py-20">
        <Header />

        <section className="flex flex-1 flex-col justify-center">
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Temporary placeholder
            </p>

            <h1 className="max-w-xl text-4xl font-medium text-zinc-950 dark:text-zinc-50 sm:text-5xl">
              Working on updates, be back soon.
            </h1>

            <p className="max-w-lg text-base leading-7 text-zinc-600 dark:text-zinc-400">
              The portfolio is offline for a short refresh. You can still reach
              me directly if needed.
            </p>

            <div className="pt-2">
              <Link
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center text-sm font-medium text-zinc-900 underline underline-offset-4 transition-colors hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-300"
              >
                {EMAIL}
              </Link>
            </div>
          </div>
        </section>

        <Footer className="mt-16" />
      </div>
    </main>
  )
}
