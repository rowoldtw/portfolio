import Link from 'next/link'
import { LandingHeader } from '@/components/landing-header'
import { SOCIAL_LINKS } from './data'

export default function HomePage() {
  return (
    <div data-landing-page="" className="bg-white dark:bg-[#080808]">
      <main className="bg-background relative z-10 mx-2.5 min-h-dvh overflow-hidden rounded-b-[24px]">
        <section
          id="home"
          data-section="home"
          className="relative flex min-h-dvh w-full items-center justify-center overflow-hidden px-4 py-20 text-left"
        >
          <LandingHeader />
        </section>
      </main>
      <footer
        aria-label="Landing footer"
        data-cursor-exclude=""
        data-cursor-link-underline=""
        className="sticky bottom-0 z-0 flex h-96 flex-col justify-between overflow-hidden bg-[#fff] px-6 pt-10 pb-24 text-zinc-900 sm:px-12 dark:bg-[#080808] dark:text-zinc-100"
      >
        <div className="flex justify-end gap-12 text-sm sm:gap-20">
          <nav
            aria-label="Footer pages"
            className="flex flex-col items-end gap-2"
          >
            <Link href="/" className="focus-visible:underline">
              <span data-cursor-link-label="">Home</span>
            </Link>
            <Link href="/projects" className="focus-visible:underline">
              <span data-cursor-link-label="">Projects</span>
            </Link>
            <Link href="/reviews" className="focus-visible:underline">
              <span data-cursor-link-label="">Reviews</span>
            </Link>
            <span
              role="link"
              aria-disabled="true"
              className="cursor-not-allowed text-zinc-400 dark:text-zinc-600"
            >
              Resume
              <span className="sr-only"> (unavailable)</span>
            </span>
          </nav>
          <nav
            aria-label="Social links"
            className="flex flex-col items-end gap-2"
          >
            {SOCIAL_LINKS.map(({ label, link }) => (
              <a
                key={label}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="focus-visible:underline"
              >
                <span data-cursor-link-label="">{label}</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </nav>
        </div>
      </footer>
    </div>
  )
}
