import Link from 'next/link'
import { EMAIL, SOCIAL_LINKS } from '@/app/data'

const STATUS_ITEMS = [
  'Refining case studies',
  'Reworking motion and layout',
  'Preparing fresh writing and experiments',
] as const

export function WipPlaceholder() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f1e8] text-stone-950">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(180,117,57,0.16),_transparent_34%),radial-gradient(circle_at_85%_15%,_rgba(37,99,235,0.14),_transparent_26%),linear-gradient(180deg,_rgba(255,255,255,0.82),_rgba(246,241,232,0.95))]" />
      <div className="absolute inset-x-6 top-6 h-px bg-black/10 sm:inset-x-10" />
      <div className="absolute inset-x-6 bottom-6 h-px bg-black/10 sm:inset-x-10" />
      <div className="absolute inset-y-6 left-6 w-px bg-black/10 sm:left-10" />
      <div className="absolute inset-y-6 right-6 w-px bg-black/10 sm:right-10" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between px-6 py-8 sm:px-10 sm:py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-4 py-2 text-sm tracking-[0.16em] uppercase backdrop-blur"
          >
            Woodrow Rowoldt
          </Link>

          <div className="inline-flex items-center gap-3 rounded-full border border-black/10 bg-black px-4 py-2 text-xs tracking-[0.22em] text-white uppercase shadow-[0_12px_32px_rgba(15,23,42,0.16)]">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300" />
            </span>
            Work In Progress
          </div>
        </div>

        <section className="grid gap-10 py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] lg:items-end lg:py-24">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-medium tracking-[0.24em] uppercase text-stone-500">
                Temporary holding page
              </p>
              <h1 className="max-w-4xl text-5xl leading-none font-medium text-balance sm:text-7xl lg:text-[6.5rem]">
                Rebuilding the portfolio with sharper work, better writing, and
                a cleaner story.
              </h1>
            </div>

            <p className="max-w-2xl text-base leading-7 text-stone-600 sm:text-lg">
              The site is intentionally offline while I rework the presentation.
              The next version will be tighter, faster, and more current.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={`mailto:${EMAIL}`}
                className="inline-flex items-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Reach me by email
              </Link>
              <Link
                href={SOCIAL_LINKS[0].link}
                className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-5 py-3 text-sm font-medium text-stone-900 backdrop-blur transition-transform duration-200 hover:-translate-y-0.5"
              >
                Follow on {SOCIAL_LINKS[0].label}
              </Link>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-black/10 bg-white/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur-sm sm:p-8">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs tracking-[0.22em] uppercase text-stone-500">
                  Current focus
                </p>
                <p className="mt-2 text-2xl font-medium text-stone-950">
                  Renovation sprint
                </p>
              </div>
              <div className="rounded-full border border-amber-900/10 bg-amber-100 px-3 py-1 text-xs tracking-[0.16em] uppercase text-amber-900">
                Live soon
              </div>
            </div>

            <div className="space-y-4">
              {STATUS_ITEMS.map((item, index) => (
                <div
                  key={item}
                  className="flex items-start gap-4 rounded-2xl border border-black/6 bg-white/70 p-4"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-stone-950 text-xs font-medium text-white">
                    0{index + 1}
                  </span>
                  <p className="pt-1 text-sm leading-6 text-stone-700">
                    {item}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-sm text-stone-600">
              {SOCIAL_LINKS.map((social) => (
                <Link
                  key={social.label}
                  href={social.link}
                  className="rounded-full border border-black/10 px-3 py-1.5 transition-colors duration-200 hover:bg-stone-950 hover:text-white"
                >
                  {social.label}
                </Link>
              ))}
            </div>
          </aside>
        </section>

        <footer className="flex flex-col gap-3 border-t border-black/10 pt-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Placeholder deployed while the main site is under reconstruction.</p>
          <p>{EMAIL}</p>
        </footer>
      </div>
    </main>
  )
}
