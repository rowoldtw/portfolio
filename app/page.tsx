'use client'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { XIcon } from 'lucide-react'
import { Magnetic } from '@/components/ui/magnetic'
import { SectionNav } from '@/components/section-nav'
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogContainer,
  MorphingDialogTitle,
  MorphingDialogSubtitle,
  MorphingDialogDescription,
  MorphingDialogImage,
} from '@/components/ui/morphing-dialog'
import Link from 'next/link'
import { AnimatedBackground } from '@/components/ui/animated-background'
import {
  PROJECTS,
  WORK_EXPERIENCE,
  BLOG_POSTS,
  EMAIL,
  SOCIAL_LINKS,
} from './data'
import { Header } from './header'
import { Footer } from './footer'

const VARIANTS_SECTION = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = {
  duration: 0.3,
}

const VIEWPORT_SECTION = { amount: 0.6, once: true } as const

const HOME_SECTIONS = [
  { id: 'home', label: 'Home' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'blog', label: 'Blog' },
  { id: 'connect', label: 'Connect' },
] as const

type HomeSectionId = (typeof HOME_SECTIONS)[number]['id']

const HOME_LAST_SECTION_STORAGE_KEY = 'portfolio:home:last-section-id'

type ProjectVideoProps = {
  src: string
}

function ProjectVideo({ src }: ProjectVideoProps) {
  return (
    <MorphingDialog
      transition={{
        type: 'spring',
        bounce: 0,
        duration: 0.3,
      }}
    >
      <MorphingDialogTrigger>
        <video
          src={src}
          autoPlay
          loop
          muted
          className="aspect-video w-full cursor-zoom-in rounded-xl"
        />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="relative aspect-video rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
          <video
            src={src}
            autoPlay
            loop
            muted
            className="aspect-video h-[50vh] w-full rounded-xl md:h-[70vh]"
          />
        </MorphingDialogContent>
        <MorphingDialogClose
          className="fixed top-6 right-6 h-fit w-fit rounded-full bg-white p-1"
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { delay: 0.3, duration: 0.1 },
            },
            exit: { opacity: 0, transition: { duration: 0 } },
          }}
        >
          <XIcon className="h-5 w-5 text-zinc-500" />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  )
}

function MagneticSocialLink({
  children,
  link,
}: {
  children: React.ReactNode
  link: string
}) {
  return (
    <Magnetic springOptions={{ bounce: 0 }} intensity={0.3}>
      <a
        href={link}
        className="group relative inline-flex shrink-0 items-center gap-px rounded-full bg-zinc-100 px-2.5 py-1 text-sm text-black transition-colors duration-200 hover:bg-zinc-950 hover:text-zinc-50 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      >
        {children}
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
        >
          <path
            d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          ></path>
        </svg>
      </a>
    </Magnetic>
  )
}

export default function Personal() {
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const [activeSectionId, setActiveSectionId] = useState<HomeSectionId>(
    HOME_SECTIONS[0].id
  )
  const intersectionRatiosRef = useRef<Record<string, number>>({})
  const isFirstSectionPersistRef = useRef(true)
  const pendingProgrammaticScrollCleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const root = scrollContainerRef.current
    if (!root) return

    const sectionEls = HOME_SECTIONS.map((section) =>
      root.querySelector<HTMLElement>(`[data-section="${section.id}"]`)
    ).filter(Boolean) as HTMLElement[]

    if (sectionEls.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset
            .section as HomeSectionId | undefined
          if (!id) continue
          intersectionRatiosRef.current[id] = entry.intersectionRatio
        }

        let bestId: HomeSectionId = HOME_SECTIONS[0].id
        let bestRatio = -1

        for (const section of HOME_SECTIONS) {
          const ratio = intersectionRatiosRef.current[section.id] ?? 0
          if (ratio > bestRatio) {
            bestRatio = ratio
            bestId = section.id
          }
        }

        setActiveSectionId(bestId)
      },
      {
        root,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    )

    for (const el of sectionEls) observer.observe(el)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const root = scrollContainerRef.current
    if (!root) return
    if (typeof window === 'undefined') return

    const toKnownSectionId = (value: string | null): HomeSectionId | null => {
      if (!value) return null
      const id = value.replace('#', '') as HomeSectionId
      return HOME_SECTIONS.some((s) => s.id === id) ? id : null
    }

    const hashId = toKnownSectionId(window.location.hash)
    let storedId: HomeSectionId | null = null

    try {
      storedId = toKnownSectionId(
        sessionStorage.getItem(HOME_LAST_SECTION_STORAGE_KEY)
      )
    } catch {
      storedId = null
    }

    const idToRestore = hashId ?? storedId
    if (!idToRestore) return

    const el = root.querySelector<HTMLElement>(
      `[data-section="${idToRestore}"]`
    )
    if (!el) return

    // Ensure layout is ready before measuring/scrolling.
    requestAnimationFrame(() => {
      scrollRootToSectionEl(root, el, 'auto')
    })
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Avoid clobbering a previously stored section with the initial default ('home')
    // before we get a chance to restore.
    if (isFirstSectionPersistRef.current) {
      isFirstSectionPersistRef.current = false
      return
    }

    try {
      sessionStorage.setItem(HOME_LAST_SECTION_STORAGE_KEY, activeSectionId)
    } catch {
      // ignore storage errors (e.g., private mode / quota)
    }
  }, [activeSectionId])

  useEffect(() => {
    return () => {
      pendingProgrammaticScrollCleanupRef.current?.()
      pendingProgrammaticScrollCleanupRef.current = null
    }
  }, [])

  function getScrollTopForSection(root: HTMLElement, sectionEl: HTMLElement) {
    const rootRect = root.getBoundingClientRect()
    const sectionRect = sectionEl.getBoundingClientRect()
    return sectionRect.top - rootRect.top + root.scrollTop
  }

  function scrollRootToSectionEl(
    root: HTMLElement,
    sectionEl: HTMLElement,
    behavior: ScrollBehavior
  ) {
    // If a programmatic scroll is already in-flight, cancel/cleanup first to avoid
    // competing timers/listeners that can cause "overscroll" in snap containers.
    pendingProgrammaticScrollCleanupRef.current?.()
    pendingProgrammaticScrollCleanupRef.current = null

    const targetTop = getScrollTopForSection(root, sectionEl)
    const prevSnapType = root.style.scrollSnapType
    const prevScrollBehavior = root.style.scrollBehavior

    // Prevent scroll-snap from influencing the programmatic scroll and snapping
    // past the intended section (this can happen intermittently across browsers).
    root.style.scrollSnapType = 'none'

    let finished = false
    let scrollEndTimeoutId: number | null = null
    let maxWaitTimeoutId: number | null = null

    const cleanup = () => {
      if (finished) return
      finished = true

      root.removeEventListener('scroll', onScroll)
      if (scrollEndTimeoutId !== null) window.clearTimeout(scrollEndTimeoutId)
      if (maxWaitTimeoutId !== null) window.clearTimeout(maxWaitTimeoutId)

      root.style.scrollSnapType = prevSnapType
      root.style.scrollBehavior = prevScrollBehavior
    }

    const finalize = () => {
      if (finished) return

      // While snap is still disabled, hard-align to the exact section top.
      root.style.scrollBehavior = 'auto'
      root.scrollTo({ top: targetTop, behavior: 'auto' })

      cleanup()
    }

    const onScroll = () => {
      if (scrollEndTimeoutId !== null) window.clearTimeout(scrollEndTimeoutId)
      scrollEndTimeoutId = window.setTimeout(finalize, 120)
    }

    pendingProgrammaticScrollCleanupRef.current = cleanup

    root.addEventListener('scroll', onScroll, { passive: true })
    root.scrollTo({ top: targetTop, behavior })

    // Trigger the "scroll end" timer even if the browser doesn't emit scroll events
    // (e.g., instant scroll, or no-op because we're already aligned).
    onScroll()
    maxWaitTimeoutId = window.setTimeout(finalize, 1500)
  }

  function scrollToSection(id: HomeSectionId) {
    const root = scrollContainerRef.current
    if (!root) return

    const el = root.querySelector<HTMLElement>(`[data-section="${id}"]`)
    if (!el) return

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    scrollRootToSectionEl(root, el, prefersReducedMotion ? 'auto' : 'smooth')

    el.focus({ preventScroll: true })
  }

  return (
    <>
      <motion.main
        ref={scrollContainerRef}
        className="relative h-dvh w-full overflow-y-auto snap-y snap-mandatory overscroll-y-contain"
      >
        <SectionNav
          sections={[...HOME_SECTIONS]}
          activeId={activeSectionId}
          onSelect={(id) => {
            const isKnown = HOME_SECTIONS.some((s) => s.id === id)
            if (!isKnown) return
            scrollToSection(id as HomeSectionId)
          }}
        />

        <motion.section
          id="home"
          data-section="home"
          tabIndex={-1}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_SECTION}
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
          className="h-dvh snap-start snap-stop-always overflow-y-auto scrollbar-gutter-stable"
        >
          <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col justify-center box-border px-4 py-20">
            <Header />

            <p className="text-zinc-600 dark:text-zinc-400">
              <span className="block">
                Focused on creating intuitive and performant neural architecture.
              </span>
              <span className="block">
                Bridging the gap between biology and technology.
              </span>
            </p>
          </div>
        </motion.section>

        <motion.section
          id="projects"
          data-section="projects"
          tabIndex={-1}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_SECTION}
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
          className="h-dvh snap-start snap-stop-always overflow-y-auto scrollbar-gutter-stable"
        >
          <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col justify-center box-border px-4 py-20">
            <h3 className="mb-5 text-lg font-medium">Projects</h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {PROJECTS.map((project) => (
                <div key={project.name} className="space-y-2">
                  <div className="relative rounded-2xl bg-zinc-50/40 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950/40 dark:ring-zinc-800/50">
                    <ProjectVideo src={project.video} />
                  </div>
                  <div className="px-1">
                    <a
                      className="font-base group relative inline-block font-[450] text-zinc-900 dark:text-zinc-50"
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {project.name}
                      <span className="absolute bottom-0.5 left-0 block h-px w-full max-w-0 bg-zinc-900 dark:bg-zinc-50 transition-all duration-200 group-hover:max-w-full"></span>
                    </a>
                    <p className="text-base text-zinc-600 dark:text-zinc-400">
                      {project.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="experience"
          data-section="experience"
          tabIndex={-1}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_SECTION}
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
          className="h-dvh snap-start snap-stop-always overflow-y-auto scrollbar-gutter-stable"
        >
          <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col justify-center box-border px-4 py-20">
            <h3 className="mb-5 text-lg font-medium">Experience</h3>
            <div className="flex flex-col space-y-3">
              {WORK_EXPERIENCE.map((job) => (
                <MorphingDialog
                  key={job.id}
                  transition={{
                    type: 'spring',
                    bounce: 0,
                    duration: 0.35,
                  }}
                >
                  <MorphingDialogTrigger className="rounded-2xl border border-zinc-200/60 bg-white/60 p-4 backdrop-blur-md transition-colors hover:bg-white/70 dark:border-zinc-800/60 dark:bg-[#121214]/60 dark:hover:bg-[#121214]/70">
                    <div className="flex w-full items-center gap-4">
                      <MorphingDialogImage
                        src="/cover.jpg"
                        alt={`${job.company} placeholder image`}
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <MorphingDialogTitle>
                          <h4 className="truncate font-normal text-zinc-900 dark:text-zinc-100">
                            {job.title}
                          </h4>
                        </MorphingDialogTitle>
                        <MorphingDialogSubtitle>
                          <p className="truncate text-zinc-500 dark:text-zinc-400">
                            {job.company}
                          </p>
                        </MorphingDialogSubtitle>
                      </div>
                      <p className="shrink-0 text-sm text-zinc-600 dark:text-zinc-400">
                        {job.start} – {job.end}
                      </p>
                    </div>
                  </MorphingDialogTrigger>

                  <MorphingDialogContainer>
                    <MorphingDialogContent className="relative w-[92vw] max-w-xl rounded-2xl bg-zinc-50 p-1 ring-1 ring-zinc-200/50 ring-inset dark:bg-zinc-950 dark:ring-zinc-800/50">
                      <div className="space-y-4 rounded-xl bg-white p-4 dark:bg-zinc-950">
                        <MorphingDialogImage
                          src="/cover.jpg"
                          alt={`${job.company} placeholder image`}
                          className="aspect-video w-full rounded-xl object-cover"
                        />

                        <div className="space-y-1">
                          <MorphingDialogTitle>
                            <h4 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
                              {job.title}
                            </h4>
                          </MorphingDialogTitle>
                          <MorphingDialogSubtitle>
                            <p className="text-zinc-600 dark:text-zinc-400">
                              {job.company} · {job.start} – {job.end}
                            </p>
                          </MorphingDialogSubtitle>
                        </div>

                        <MorphingDialogDescription
                          className="text-sm text-zinc-600 dark:text-zinc-400"
                          variants={{
                            initial: { opacity: 0, y: 6, filter: 'blur(4px)' },
                            animate: {
                              opacity: 1,
                              y: 0,
                              filter: 'blur(0px)',
                              transition: { delay: 0.15, duration: 0.2 },
                            },
                            exit: {
                              opacity: 0,
                              y: 6,
                              filter: 'blur(4px)',
                              transition: { duration: 0 },
                            },
                          }}
                        >
                          <p>
                            Placeholder details for this role. Add real highlights,
                            impact metrics, and technologies when you’re ready.
                          </p>
                        </MorphingDialogDescription>

                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={job.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-3 py-1 text-sm text-zinc-900 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
                          >
                            View link
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3 w-3"
                            >
                              <path
                                d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
                                fill="currentColor"
                                fillRule="evenodd"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </MorphingDialogContent>

                    <MorphingDialogClose
                      className="fixed top-6 right-6 h-fit w-fit rounded-full bg-white p-1 ring-1 ring-zinc-200 dark:bg-zinc-950 dark:ring-zinc-800"
                      variants={{
                        initial: { opacity: 0 },
                        animate: {
                          opacity: 1,
                          transition: { delay: 0.2, duration: 0.1 },
                        },
                        exit: { opacity: 0, transition: { duration: 0 } },
                      }}
                    >
                      <XIcon className="h-5 w-5 text-zinc-500" />
                    </MorphingDialogClose>
                  </MorphingDialogContainer>
                </MorphingDialog>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="blog"
          data-section="blog"
          tabIndex={-1}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_SECTION}
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
          className="h-dvh snap-start snap-stop-always overflow-y-auto scrollbar-gutter-stable"
        >
          <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col justify-center box-border px-4 py-20">
            <h3 className="mb-3 text-lg font-medium">Blog</h3>
            <div className="flex flex-col space-y-0">
              <AnimatedBackground
                enableHover
                className="h-full w-full rounded-lg bg-zinc-100 dark:bg-zinc-900/80"
                transition={{
                  type: 'spring',
                  bounce: 0,
                  duration: 0.2,
                }}
              >
                {BLOG_POSTS.map((post) => (
                  <Link
                    key={post.uid}
                    className="-mx-3 rounded-xl px-3 py-3"
                    href={post.link}
                    data-id={post.uid}
                  >
                    <div className="flex flex-col space-y-1">
                      <h4 className="font-normal dark:text-zinc-100">
                        {post.title}
                      </h4>
                      <p className="text-zinc-500 dark:text-zinc-400">
                        {post.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </AnimatedBackground>
            </div>
          </div>
        </motion.section>

        <motion.section
          id="connect"
          data-section="connect"
          tabIndex={-1}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_SECTION}
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
          className="h-dvh snap-start snap-stop-always overflow-y-auto scrollbar-gutter-stable"
        >
          <div className="mx-auto flex min-h-full w-full max-w-screen-sm flex-col justify-center box-border px-4 py-20">
            <h3 className="mb-5 text-lg font-medium">Connect</h3>
            <p className="mb-5 text-zinc-600 dark:text-zinc-400">
              Feel free to contact me at{' '}
              <a
                className="underline dark:text-zinc-300"
                href={`mailto:${EMAIL}`}
              >
                {EMAIL}
              </a>
            </p>
            <div className="flex flex-wrap items-center justify-start gap-3">
              {SOCIAL_LINKS.map((link) => (
                <MagneticSocialLink key={link.label} link={link.link}>
                  {link.label}
                </MagneticSocialLink>
              ))}
            </div>
          </div>
        </motion.section>
      </motion.main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <div className="pointer-events-auto mx-auto w-full max-w-screen-sm px-4">
          <Footer
            className="mt-0 rounded-2xl border border-zinc-200/60 bg-white/60 px-4 py-3 shadow-lg shadow-zinc-900/10 backdrop-blur-md dark:border-zinc-800/60 dark:bg-[#121214]/60 dark:shadow-black/40"
          />
        </div>
      </div>
    </>
  )
}
