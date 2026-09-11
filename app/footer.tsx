'use client'
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Command as CommandIcon } from 'lucide-react'
import { CommandMenu } from '@/components/command-menu'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import {
  type PagePreview,
  PagePreviewTooltip,
} from '@/components/ui/page-preview-tooltip'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

const PAGE_LINKS = [
  { id: 'professional', label: 'Professional', href: '/', disabled: false },
  { id: 'gallery', label: 'Gallery', href: '/gallery', disabled: true },
  { id: 'personal', label: 'Personal', href: '/personal', disabled: true },
] as const
const LANDING_SECTION_EVENT = 'portfolio:current-page-landing'

type ActivePagePreview = {
  pathname: string
  preview: PagePreview
}

function getActivePageId(pathname: string) {
  if (pathname.startsWith('/gallery')) return 'gallery'
  if (pathname.startsWith('/personal') || pathname.startsWith('/blog')) {
    return 'personal'
  }
  return 'professional'
}

export function Footer({ className }: { className?: string }) {
  const pathname = usePathname()
  const activePageId = getActivePageId(pathname)
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false)
  const [activePagePreview, setActivePagePreview] =
    useState<ActivePagePreview | null>(null)
  const [pagePreviewX, setPagePreviewX] = useState(0)
  const pagesNavRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const pagePreview =
    activePagePreview?.pathname === pathname ? activePagePreview.preview : null

  const showPagePreview = useCallback(
    (target: HTMLAnchorElement, preview: PagePreview) => {
      const navRect = pagesNavRef.current?.getBoundingClientRect()
      if (!navRect) return

      const targetRect = target.getBoundingClientRect()
      setPagePreviewX(targetRect.left - navRect.left + targetRect.width / 2)
      setActivePagePreview({ pathname, preview })
    },
    [pathname],
  )

  const clearPagePreviewSelection = useCallback(() => {
    setActivePagePreview(null)

    const activeElement = document.activeElement
    if (
      activeElement instanceof HTMLElement &&
      pagesNavRef.current?.contains(activeElement)
    ) {
      activeElement.blur()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('blur', clearPagePreviewSelection)
    window.addEventListener('focus', clearPagePreviewSelection)
    window.addEventListener('pagehide', clearPagePreviewSelection)
    window.addEventListener('pageshow', clearPagePreviewSelection)
    document.addEventListener('visibilitychange', clearPagePreviewSelection)

    return () => {
      window.removeEventListener('blur', clearPagePreviewSelection)
      window.removeEventListener('focus', clearPagePreviewSelection)
      window.removeEventListener('pagehide', clearPagePreviewSelection)
      window.removeEventListener('pageshow', clearPagePreviewSelection)
      document.removeEventListener(
        'visibilitychange',
        clearPagePreviewSelection,
      )
    }
  }, [clearPagePreviewSelection])

  const handlePageLinkClick = (
    event: MouseEvent<HTMLAnchorElement>,
    link: (typeof PAGE_LINKS)[number],
  ) => {
    event.currentTarget.blur()
    clearPagePreviewSelection()

    const isCurrentPage =
      link.href === '/' ? pathname === '/' : pathname === link.href

    if (!isCurrentPage) return

    event.preventDefault()
    setIsCommandMenuOpen(false)

    if (link.id === 'professional') {
      window.dispatchEvent(new CustomEvent(LANDING_SECTION_EVENT))
      return
    }

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-50 flex justify-center pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]">
      <div className="pointer-events-auto relative w-fit">
        <CommandMenu
          open={isCommandMenuOpen}
          onOpenChange={setIsCommandMenuOpen}
        />
        <footer
          className={cn(
            'floating-nav-chrome pointer-events-auto rounded-[2rem] border border-white/70 bg-[#f4f4f4]/50 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-[#181818]/75',
            className,
          )}
        >
          <div className="flex items-center">
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <nav
                ref={pagesNavRef}
                aria-label="Pages"
                onMouseLeave={() => setActivePagePreview(null)}
                className="relative flex items-center rounded-full bg-black/[0.035] p-0.5 dark:bg-white/[0.06]"
              >
                <PagePreviewTooltip preview={pagePreview} x={pagePreviewX} />
                <AnimatedBackground
                  value={activePageId}
                  className="rounded-full bg-white shadow-sm dark:bg-zinc-950"
                  transition={{
                    type: 'spring',
                    bounce: 0,
                    duration: 0.2,
                  }}
                >
                  {PAGE_LINKS.map((link) =>
                    link.disabled ? (
                      <span
                        key={link.id}
                        data-id={link.id}
                        aria-disabled="true"
                        title="Page temporarily disabled"
                        className="pointer-events-none cursor-not-allowed rounded-full px-2.5 py-1.5 text-zinc-400 line-through decoration-zinc-400/70 dark:text-zinc-600 dark:decoration-zinc-600"
                      >
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        key={link.id}
                        href={link.href}
                        data-id={link.id}
                        onMouseEnter={(event) =>
                          showPagePreview(event.currentTarget, link)
                        }
                        onFocus={(event) =>
                          showPagePreview(event.currentTarget, link)
                        }
                        onBlur={() => setActivePagePreview(null)}
                        onClick={(event) => handlePageLinkClick(event, link)}
                        className="rounded-full px-2.5 py-1.5 text-zinc-500 transition-colors hover:text-zinc-900 data-[checked=true]:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 dark:data-[checked=true]:text-zinc-50"
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </AnimatedBackground>
              </nav>
              <AnimatedThemeToggler />
              <button
                type="button"
                aria-label="Open command menu (Command K)"
                aria-expanded={isCommandMenuOpen}
                onClick={() => setIsCommandMenuOpen(true)}
                className={cn(
                  'inline-flex size-7 items-center justify-center rounded-full text-zinc-500 transition-[background-color,color,transform] duration-200 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500/60',
                  isCommandMenuOpen &&
                    'bg-zinc-100 text-zinc-950 dark:bg-zinc-800/80 dark:text-zinc-50',
                )}
              >
                <CommandIcon aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
