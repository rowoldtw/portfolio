'use client'
import {
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { LayoutGroup, MotionConfig, motion } from 'motion/react'
import { useReviewCollection } from '@/components/review-collection-provider'
import { usePathname, useRouter } from 'next/navigation'
import {
  AppWindow,
  Command as CommandIcon,
  Cpu,
  Disc3,
  Folder,
  MessageSquareText,
  UserRound,
} from 'lucide-react'
import { AnimatedBackground } from '@/components/ui/animated-background'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import type { PagePreview } from '@/components/ui/page-preview-tooltip'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { cn } from '@/lib/utils'

const MotionLink = motion.create(Link)
const CommandMenu = dynamic(() =>
  import('@/components/command-menu').then((module) => module.CommandMenu),
)
const PagePreviewTooltip = dynamic(() =>
  import('@/components/ui/page-preview-tooltip').then(
    (module) => module.PagePreviewTooltip,
  ),
)
const reviewOptions = [
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'software', label: 'Software', icon: AppWindow },
  { id: 'albums', label: 'Albums', icon: Disc3 },
] as const

const PAGE_LINKS = [
  {
    id: 'professional',
    label: 'Professional',
    href: '/',
    disabled: false,
    icon: UserRound,
  },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    disabled: false,
    icon: Folder,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    href: '/reviews',
    disabled: false,
    icon: MessageSquareText,
  },
] as const

type ActivePagePreview = {
  pathname: string
  preview: PagePreview
}

function getActivePageId(pathname: string) {
  if (pathname.startsWith('/projects')) return 'projects'
  if (pathname.startsWith('/reviews')) {
    return 'reviews'
  }
  return 'professional'
}

function NavbarItems({
  animateLayout,
  hasHydrated,
  prefersReducedMotion,
  activeItemId,
  reviewsExpanded,
  activePageId,
  collection,
  onPreview,
  onPreviewBlur,
  onPageLinkClick,
  onCollectionSelect,
}: {
  animateLayout: boolean
  hasHydrated: boolean
  prefersReducedMotion: boolean
  activeItemId: string
  reviewsExpanded: boolean
  activePageId: string
  collection: (typeof reviewOptions)[number]['id']
  onPreview: (target: HTMLAnchorElement, preview: PagePreview) => void
  onPreviewBlur: () => void
  onPageLinkClick: (
    event: MouseEvent<HTMLAnchorElement>,
    link: (typeof PAGE_LINKS)[number],
  ) => void
  onCollectionSelect: (id: (typeof reviewOptions)[number]['id']) => void
}) {
  return (
    <AnimatedBackground
      value={reviewsExpanded && !hasHydrated ? null : activeItemId}
      className="rounded-full bg-white shadow-sm dark:bg-zinc-950"
      transition={{
        type: 'spring',
        bounce: 0,
        duration: prefersReducedMotion ? 0 : 0.2,
      }}
    >
      {[
        ...PAGE_LINKS.filter(
          (link) => !reviewsExpanded || link.id !== 'reviews',
        ).map((link) => (
          <MotionLink
            layout={animateLayout ? 'position' : false}
            key={link.id}
            href={link.href}
            prefetch={false}
            data-id={link.id}
            aria-label={link.label}
            aria-current={activePageId === link.id ? 'page' : undefined}
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') {
                onPreview(event.currentTarget, link)
              }
            }}
            onFocus={(event) => {
              if (event.currentTarget.matches(':focus-visible')) {
                onPreview(event.currentTarget, link)
              }
            }}
            onBlur={onPreviewBlur}
            onClick={(event) => onPageLinkClick(event, link)}
            className="shrink-0 rounded-full px-2.5 py-1.5 whitespace-nowrap text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] data-[checked=true]:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 dark:data-[checked=true]:text-zinc-50"
          >
            <span data-navbar-label="">{link.label}</span>
            <link.icon
              aria-hidden="true"
              data-navbar-icon=""
              className="size-4"
            />
          </MotionLink>
        )),
        ...(reviewsExpanded
          ? reviewOptions.map(({ id, label, icon: Icon }) => (
              <motion.button
                layout={animateLayout ? 'position' : false}
                key={id}
                type="button"
                data-id={id}
                aria-label={label}
                aria-pressed={collection === id}
                onClick={() => onCollectionSelect(id)}
                className={cn(
                  'shrink-0 rounded-full px-2.5 py-1.5 whitespace-nowrap text-zinc-600 transition-colors hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-[-2px] data-[checked=true]:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100 dark:data-[checked=true]:text-zinc-50',
                  id === 'hardware' &&
                    'ml-4 before:absolute before:top-1/2 before:-left-2 before:h-4 before:w-px before:-translate-y-1/2 before:bg-zinc-400 dark:before:bg-zinc-500',
                )}
              >
                <span data-navbar-label="">{label}</span>
                <Icon
                  aria-hidden="true"
                  data-navbar-icon=""
                  className="size-4"
                />
              </motion.button>
            ))
          : []),
      ]}
    </AnimatedBackground>
  )
}

function NavbarActions({
  animateLayout,
  isCommandMenuOpen,
  onOpenCommandMenu,
}: {
  animateLayout: boolean
  isCommandMenuOpen: boolean
  onOpenCommandMenu: () => void
}) {
  return (
    <motion.div
      layout={animateLayout ? 'position' : false}
      data-navbar-actions=""
      className="flex shrink-0 items-center gap-2"
    >
      <AnimatedThemeToggler />
      <button
        type="button"
        aria-label="Open command menu (Command K)"
        aria-expanded={isCommandMenuOpen}
        onClick={() => {
          onOpenCommandMenu()
        }}
        className={cn(
          'inline-flex size-7 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-[background-color,color,transform] duration-200 hover:bg-zinc-100 hover:text-zinc-950 focus-visible:ring-2 focus-visible:ring-zinc-400/60 focus-visible:outline-none dark:text-zinc-400 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500/60',
          isCommandMenuOpen &&
            'bg-zinc-100 text-zinc-950 dark:bg-zinc-800/80 dark:text-zinc-50',
        )}
      >
        <CommandIcon aria-hidden="true" className="size-4" />
      </button>
    </motion.div>
  )
}

export function Footer({ className }: { className?: string }) {
  const navbarRef = useRef<HTMLElement>(null)
  useEffect(() => {
    const navbar = navbarRef.current
    if (!navbar) return
    const updateHeight = () =>
      document.documentElement.style.setProperty(
        '--site-navbar-height',
        `${navbar.offsetHeight}px`,
      )
    const observer = new ResizeObserver(updateHeight)
    observer.observe(navbar)
    updateHeight()
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--site-navbar-height')
    }
  }, [])
  const pathname = usePathname()
  const router = useRouter()
  const activePageId = getActivePageId(pathname)
  const { collection, setCollection } = useReviewCollection()
  const [hasHydrated, setHasHydrated] = useState(false)
  useEffect(() => {
    const frame = requestAnimationFrame(() => setHasHydrated(true))
    return () => cancelAnimationFrame(frame)
  }, [])
  const reviewsExpanded = activePageId === 'reviews'
  const activeItemId = reviewsExpanded ? collection : activePageId
  const [isCommandMenuOpen, setIsCommandMenuOpen] = useState(false)
  const [hasOpenedCommandMenu, setHasOpenedCommandMenu] = useState(false)
  const [hasOpenedPagePreview, setHasOpenedPagePreview] = useState(false)
  const [activePagePreview, setActivePagePreview] =
    useState<ActivePagePreview | null>(null)
  const [pagePreviewX, setPagePreviewX] = useState(0)
  const [animatePagePreviewPosition, setAnimatePagePreviewPosition] =
    useState(false)
  const pagePreviewSessionRef = useRef<string | null>(null)
  const pagesNavRef = useRef<HTMLElement | null>(null)
  const pagePreviewCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )
  const prefersReducedMotion = usePrefersReducedMotion()
  const animateLayout = !prefersReducedMotion
  const pagePreview =
    activePagePreview?.pathname === pathname ? activePagePreview.preview : null

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'k' ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return
      }

      event.preventDefault()
      setHasOpenedCommandMenu(true)
      setIsCommandMenuOpen((open) => !open)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const cancelPagePreviewClose = useCallback(() => {
    if (!pagePreviewCloseTimerRef.current) return
    clearTimeout(pagePreviewCloseTimerRef.current)
    pagePreviewCloseTimerRef.current = null
  }, [])

  const schedulePagePreviewClose = useCallback(() => {
    pagePreviewSessionRef.current = null
    cancelPagePreviewClose()
    pagePreviewCloseTimerRef.current = setTimeout(() => {
      setActivePagePreview(null)
      pagePreviewCloseTimerRef.current = null
    }, 220)
  }, [cancelPagePreviewClose])

  const showPagePreview = useCallback(
    (target: HTMLAnchorElement, preview: PagePreview) => {
      cancelPagePreviewClose()
      const navRect = pagesNavRef.current?.getBoundingClientRect()
      if (!navRect) return

      const targetRect = target.getBoundingClientRect()
      router.prefetch(preview.href)
      setAnimatePagePreviewPosition(pagePreviewSessionRef.current === pathname)
      pagePreviewSessionRef.current = pathname
      setHasOpenedPagePreview(true)
      setPagePreviewX(targetRect.left - navRect.left + targetRect.width / 2)
      setActivePagePreview({ pathname, preview })
    },
    [cancelPagePreviewClose, pathname, router],
  )

  const clearPagePreviewSelection = useCallback(() => {
    pagePreviewSessionRef.current = null
    cancelPagePreviewClose()
    setActivePagePreview(null)

    const activeElement = document.activeElement
    if (
      activeElement instanceof HTMLElement &&
      pagesNavRef.current?.contains(activeElement)
    ) {
      activeElement.blur()
    }
  }, [cancelPagePreviewClose])

  useEffect(() => {
    window.addEventListener('blur', clearPagePreviewSelection)
    window.addEventListener('focus', clearPagePreviewSelection)
    window.addEventListener('pagehide', clearPagePreviewSelection)
    window.addEventListener('pageshow', clearPagePreviewSelection)
    document.addEventListener('visibilitychange', clearPagePreviewSelection)

    return () => {
      cancelPagePreviewClose()
      window.removeEventListener('blur', clearPagePreviewSelection)
      window.removeEventListener('focus', clearPagePreviewSelection)
      window.removeEventListener('pagehide', clearPagePreviewSelection)
      window.removeEventListener('pageshow', clearPagePreviewSelection)
      document.removeEventListener(
        'visibilitychange',
        clearPagePreviewSelection,
      )
    }
  }, [cancelPagePreviewClose, clearPagePreviewSelection])

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

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <MotionConfig
      transition={{
        type: 'spring',
        bounce: 0,
        duration: animateLayout ? 0.2 : 0,
      }}
      reducedMotion="user"
    >
      <LayoutGroup>
        <motion.div
          layoutRoot={animateLayout}
          data-site-navbar-root=""
          data-reviews-expanded={reviewsExpanded}
          className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pr-[max(1rem,env(safe-area-inset-right))] pl-[max(1rem,env(safe-area-inset-left))]"
        >
          <div
            data-cursor-exclude=""
            data-site-navbar-shell=""
            className="pointer-events-auto relative w-fit max-w-full"
          >
            <div aria-hidden="true" data-site-navbar-frame="" />
            {hasOpenedCommandMenu && (
              <CommandMenu
                open={isCommandMenuOpen}
                onOpenChange={setIsCommandMenuOpen}
              />
            )}
            <motion.footer
              ref={navbarRef}
              layout={animateLayout}
              data-site-navbar=""
              style={{ borderRadius: 32 }}
              className={cn(
                'pointer-events-auto max-w-full rounded-[2rem] bg-[#f4f4f4]/50 p-2 backdrop-blur-xl dark:bg-[#181818]/75',
                className,
              )}
            >
              <div
                data-navbar-row=""
                className="flex min-w-0 items-center gap-2 text-xs text-zinc-400"
              >
                <motion.nav
                  layout={animateLayout}
                  layoutDependency={reviewsExpanded}
                  ref={pagesNavRef}
                  aria-label="Pages"
                  onMouseEnter={cancelPagePreviewClose}
                  onMouseLeave={schedulePagePreviewClose}
                  className="relative flex min-w-0 items-center overflow-visible rounded-full bg-black/[0.035] p-0.5 dark:bg-white/[0.06]"
                >
                  {!reviewsExpanded && hasOpenedPagePreview && (
                    <PagePreviewTooltip
                      animatePosition={animatePagePreviewPosition}
                      preview={pagePreview}
                      x={pagePreviewX}
                      onMouseEnter={cancelPagePreviewClose}
                      onMouseLeave={schedulePagePreviewClose}
                      onReviewSelect={setCollection}
                    />
                  )}
                  <NavbarItems
                    animateLayout={animateLayout}
                    hasHydrated={hasHydrated}
                    prefersReducedMotion={prefersReducedMotion}
                    activeItemId={activeItemId}
                    reviewsExpanded={reviewsExpanded}
                    activePageId={activePageId}
                    collection={collection}
                    onPreview={showPagePreview}
                    onPreviewBlur={schedulePagePreviewClose}
                    onPageLinkClick={handlePageLinkClick}
                    onCollectionSelect={(id) => {
                      setCollection(id)
                      setActivePagePreview(null)
                      window.scrollTo({ top: 0, behavior: 'instant' })
                    }}
                  />
                </motion.nav>
                <NavbarActions
                  animateLayout={animateLayout}
                  isCommandMenuOpen={isCommandMenuOpen}
                  onOpenCommandMenu={() => {
                    setHasOpenedCommandMenu(true)
                    setIsCommandMenuOpen(true)
                  }}
                />
              </div>
            </motion.footer>
          </div>
        </motion.div>
      </LayoutGroup>
    </MotionConfig>
  )
}
