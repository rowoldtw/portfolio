'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { TextLoop } from '@/components/ui/text-loop'
import { cn } from '@/lib/utils'

const PAGE_LINKS = [
  { id: 'professional', label: 'Professional', href: '/' },
  { id: 'gallery', label: 'Gallery', href: '/gallery' },
  { id: 'personal', label: 'Personal', href: '/personal' },
] as const

function getActivePageId(pathname: string) {
  if (pathname.startsWith('/gallery')) return 'gallery'
  if (pathname.startsWith('/personal')) return 'personal'
  return 'professional'
}

export function Footer({
  className,
}: {
  className?: string
}) {
  const pathname = usePathname()
  const activePageId = getActivePageId(pathname)

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="mx-auto w-full max-w-screen-sm px-4">
        <footer
          className={cn(
            'pointer-events-auto rounded-full border border-zinc-200/60 bg-white/60 px-4 py-3 shadow-lg shadow-zinc-900/10 backdrop-blur-md dark:border-zinc-800/60 dark:bg-[#111]/60 dark:shadow-black/40',
            className,
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <a
              href="https://github.com/rowoldtw"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-full outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60 dark:focus-visible:ring-zinc-500/60"
            >
              <TextLoop
                interval={5}
                pauseOnHover
                className="text-xs text-zinc-500 underline decoration-transparent underline-offset-4 transition-colors group-hover:text-zinc-900 group-hover:decoration-zinc-400 dark:group-hover:text-zinc-100 dark:group-hover:decoration-zinc-600"
              >
                <span>© 2026 Woodrow Rowoldt</span>
                <span>Last update: 04/27/26</span>
              </TextLoop>
            </a>

            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <nav
                aria-label="Pages"
                className="flex items-center rounded-full border border-zinc-200/60 p-0.5 dark:border-zinc-800/60"
              >
                <AnimatedBackground
                  value={activePageId}
                  className="rounded-full bg-zinc-100 dark:bg-zinc-800/80"
                  transition={{
                    type: 'spring',
                    bounce: 0,
                    duration: 0.34,
                  }}
                >
                  {PAGE_LINKS.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      data-id={link.id}
                      className="rounded-full px-2.5 py-1.5 text-zinc-500 transition-colors hover:text-zinc-900 data-[checked=true]:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 dark:data-[checked=true]:text-zinc-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                </AnimatedBackground>
              </nav>
              <AnimatedThemeToggler />
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
