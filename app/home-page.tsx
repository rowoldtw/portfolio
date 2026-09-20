import Link from 'next/link'
import { Header } from './header'
import { SOCIAL_LINKS } from './data'

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-[#080808]">
      <main className="bg-background relative z-10 mx-2.5 min-h-dvh rounded-b-[24px]">
        <section
          id="home"
          data-section="home"
          className="mx-auto flex min-h-dvh w-full max-w-screen-sm flex-col items-center justify-center px-4 py-20 text-left"
        >
          <Header className="mb-0" landing />
        </section>
      </main>
      <footer
        aria-label="Landing footer"
        data-cursor-exclude=""
        className="sticky bottom-0 z-0 flex h-96 flex-col justify-between overflow-hidden bg-[#fff] px-6 pt-10 pb-24 text-zinc-900 sm:px-12 dark:bg-[#080808] dark:text-zinc-100"
      >
        <div className="flex justify-end gap-12 text-sm sm:gap-20">
          <nav
            aria-label="Footer pages"
            className="flex flex-col items-end gap-2"
          >
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <Link href="/projects" className="hover:underline">
              Projects
            </Link>
            <Link href="/reviews" className="hover:underline">
              Reviews
            </Link>
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
                className="hover:underline"
              >
                {label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ))}
          </nav>
        </div>
        <p className="text-[clamp(2rem,8vw,7rem)] leading-none font-medium">
          Woodrow Rowoldt
        </p>
      </footer>
    </div>
  )
}
