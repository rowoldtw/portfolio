'use client'
import { useCallback, useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import {
  BriefcaseBusiness,
  BadgeCheck,
  FolderKanban,
  HomeIcon,
  Mail,
} from 'lucide-react'
import { useHomeSection } from '@/components/home-section-provider'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import {
  CERTIFICATIONS,
  CONCEPT_IDEAS,
  EMAIL,
  FAMILIAR_TOOLS,
  PROJECTS,
  SKILLS,
  SOCIAL_LINKS,
  WORK_EXPERIENCE,
} from './data'
import { Header } from './header'

const VARIANTS_SECTION = {
  hidden: { opacity: 0, filter: 'blur(8px)' },
  visible: { opacity: 1, filter: 'blur(0px)' },
}

const TRANSITION_SECTION = {
  duration: 0.3,
}

const VIEWPORT_SECTION = { amount: 0.6, once: true } as const

const HOME_SECTIONS = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'projects', label: 'Projects / GitHub', icon: FolderKanban },
  { id: 'experience', label: 'Experience', icon: BriefcaseBusiness },
  { id: 'skills', label: 'Skills / Certifications', icon: BadgeCheck },
  { id: 'connect', label: 'Connect', icon: Mail },
] as const

type HomeSectionId = (typeof HOME_SECTIONS)[number]['id']

const HOME_LAST_SECTION_STORAGE_KEY = 'portfolio:home:last-section-id'
const LANDING_SECTION_EVENT = 'portfolio:current-page-landing'
const HOME_SECTION_EVENT = 'portfolio:home-section-select'

function toKnownSectionId(value: string | null): HomeSectionId | null {
  if (!value) return null
  const id = value.replace('#', '') as HomeSectionId
  return HOME_SECTIONS.some((section) => section.id === id) ? id : null
}

function getScrollTopForSection(root: HTMLElement, sectionEl: HTMLElement) {
  const rootRect = root.getBoundingClientRect()
  const sectionRect = sectionEl.getBoundingClientRect()
  return sectionRect.top - rootRect.top + root.scrollTop
}

export default function Personal() {
  const scrollContainerRef = useRef<HTMLElement | null>(null)
  const { activeHomeSectionId, setActiveHomeSectionId } = useHomeSection()
  const prefersReducedMotion = usePrefersReducedMotion()
  const activeSectionId =
    toKnownSectionId(activeHomeSectionId) ?? HOME_SECTIONS[0].id
  const intersectionRatiosRef = useRef<Record<string, number>>({})
  const isFirstSectionPersistRef = useRef(true)
  const pendingProgrammaticScrollCleanupRef = useRef<(() => void) | null>(null)
  const isRestoringSectionRef = useRef(false)

  const scrollRootToSectionEl = useCallback(
    (root: HTMLElement, sectionEl: HTMLElement, behavior: ScrollBehavior) => {
      pendingProgrammaticScrollCleanupRef.current?.()
      pendingProgrammaticScrollCleanupRef.current = null

      const targetTop = getScrollTopForSection(root, sectionEl)
      const prevSnapType = root.style.scrollSnapType
      const prevScrollBehavior = root.style.scrollBehavior

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

        root.style.scrollBehavior = 'auto'
        root.scrollTo({ top: targetTop, behavior: 'auto' })

        cleanup()
      }

      const onScroll = () => {
        if (scrollEndTimeoutId !== null) window.clearTimeout(scrollEndTimeoutId)
        scrollEndTimeoutId = window.setTimeout(finalize, 140)
      }

      pendingProgrammaticScrollCleanupRef.current = cleanup

      root.addEventListener('scroll', onScroll, { passive: true })
      root.scrollTo({ top: targetTop, behavior })

      onScroll()
      maxWaitTimeoutId = window.setTimeout(finalize, 1200)
    },
    [],
  )

  useEffect(() => {
    const root = scrollContainerRef.current
    if (!root) return

    const sectionEls = HOME_SECTIONS.map((section) =>
      root.querySelector<HTMLElement>(`[data-section="${section.id}"]`),
    ).filter(Boolean) as HTMLElement[]

    if (sectionEls.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (isRestoringSectionRef.current) return

        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.section as
            | HomeSectionId
            | undefined
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

        setActiveHomeSectionId(bestId)
      },
      {
        root,
        threshold: [0, 0.25, 0.5, 0.75, 1],
      },
    )

    for (const el of sectionEls) observer.observe(el)

    return () => observer.disconnect()
  }, [setActiveHomeSectionId])

  useEffect(() => {
    const root = scrollContainerRef.current
    if (!root) return
    if (typeof window === 'undefined') return

    const hashId = toKnownSectionId(window.location.hash)
    let storedId: HomeSectionId | null = null

    try {
      storedId = toKnownSectionId(
        sessionStorage.getItem(HOME_LAST_SECTION_STORAGE_KEY),
      )
    } catch {
      storedId = null
    }

    const idToRestore = hashId ?? storedId
    if (!idToRestore) return

    const el = root.querySelector<HTMLElement>(
      `[data-section="${idToRestore}"]`,
    )
    if (!el) return

    isRestoringSectionRef.current = true
    requestAnimationFrame(() => {
      setActiveHomeSectionId(idToRestore)
      scrollRootToSectionEl(root, el, 'auto')
      requestAnimationFrame(() => {
        isRestoringSectionRef.current = false
        setActiveHomeSectionId(idToRestore)
      })
    })
  }, [scrollRootToSectionEl, setActiveHomeSectionId])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (
      isFirstSectionPersistRef.current &&
      activeSectionId === HOME_SECTIONS[0].id
    ) {
      isFirstSectionPersistRef.current = false
      return
    }

    isFirstSectionPersistRef.current = false

    try {
      sessionStorage.setItem(HOME_LAST_SECTION_STORAGE_KEY, activeSectionId)
    } catch {}
  }, [activeSectionId])

  useEffect(() => {
    return () => {
      pendingProgrammaticScrollCleanupRef.current?.()
      pendingProgrammaticScrollCleanupRef.current = null
    }
  }, [])

  const scrollToSection = useCallback(
    (id: HomeSectionId) => {
      const root = scrollContainerRef.current
      if (!root) return

      const el = root.querySelector<HTMLElement>(`[data-section="${id}"]`)
      if (!el) return

      scrollRootToSectionEl(root, el, prefersReducedMotion ? 'auto' : 'smooth')

      el.focus({ preventScroll: true })
    },
    [prefersReducedMotion, scrollRootToSectionEl],
  )

  useEffect(() => {
    const handleLandingSection = (event: Event) => {
      const detail = (event as CustomEvent<{ id?: string }>).detail
      const id = toKnownSectionId(detail?.id ?? HOME_SECTIONS[0].id)

      scrollToSection(id ?? HOME_SECTIONS[0].id)
    }

    window.addEventListener(LANDING_SECTION_EVENT, handleLandingSection)
    window.addEventListener(HOME_SECTION_EVENT, handleLandingSection)

    return () => {
      window.removeEventListener(LANDING_SECTION_EVENT, handleLandingSection)
      window.removeEventListener(HOME_SECTION_EVENT, handleLandingSection)
    }
  }, [scrollToSection])

  return (
    <>
      <motion.main
        ref={scrollContainerRef}
        className="scrollbar-hidden bg-background relative h-dvh w-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain dark:bg-[#111]"
      >
        <motion.section
          id="home"
          data-section="home"
          tabIndex={-1}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_SECTION}
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
          className="snap-stop-always scrollbar-hidden bg-background relative h-dvh snap-start overflow-y-auto dark:bg-[#111]"
        >
          <div className="mx-auto box-border flex min-h-full w-full max-w-screen-sm flex-col items-center justify-center px-4 py-20 text-center">
            <Header className="mb-0" />
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
          className="snap-stop-always scrollbar-hidden bg-background h-dvh snap-start overflow-y-auto dark:bg-[#111]"
        >
          <div className="mx-auto box-border flex min-h-full w-full max-w-screen-sm flex-col justify-center px-4 py-20">
            <h3 className="mb-5 text-lg font-medium">Projects</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PROJECTS.map((project) => (
                <article
                  key={project.id}
                  className="rounded-2xl border border-zinc-200/60 bg-white/60 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/40"
                >
                  <h4 className="font-[450] text-zinc-900 dark:text-zinc-50">
                    {project.name}
                  </h4>
                  <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                    {project.description}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    - {project.status}
                  </p>
                </article>
              ))}
              <h4 className="mt-1 text-sm font-medium text-zinc-950 sm:col-span-2 dark:text-zinc-50">
                Concepts
              </h4>
              <div className="grid grid-cols-2 gap-2 sm:col-span-2 sm:gap-3">
                {CONCEPT_IDEAS.map((concept) => (
                  <article
                    key={concept.id}
                    className="rounded-2xl border border-zinc-200/60 bg-white/60 p-3 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/40"
                  >
                    <h5 className="text-xs font-medium text-zinc-800 sm:text-sm dark:text-zinc-200">
                      {concept.name}
                    </h5>
                    <p className="mt-1 text-xs leading-4 text-zinc-600 sm:text-sm sm:leading-5 dark:text-zinc-400">
                      {concept.description}
                    </p>
                    <p className="mt-2 text-[11px] text-zinc-500 sm:text-xs dark:text-zinc-500">
                      - {concept.status}
                    </p>
                  </article>
                ))}
              </div>
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
          className="snap-stop-always scrollbar-hidden bg-background h-dvh snap-start overflow-y-auto dark:bg-[#111]"
        >
          <div className="mx-auto box-border flex min-h-full w-full max-w-screen-sm flex-col justify-center px-4 py-20">
            <h3 className="mb-5 text-lg font-medium">Experience</h3>
            <div className="flex flex-col space-y-3">
              {WORK_EXPERIENCE.map((job) => (
                <article
                  key={job.id}
                  className="rounded-2xl border border-zinc-200/60 bg-white/60 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/40"
                >
                  <h4 className="font-[450] text-zinc-900 dark:text-zinc-50">
                    {job.title}
                  </h4>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                    {job.company}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                    {job.date}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </motion.section>

        <motion.section
          id="skills"
          data-section="skills"
          tabIndex={-1}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_SECTION}
          variants={VARIANTS_SECTION}
          transition={TRANSITION_SECTION}
          className="snap-stop-always scrollbar-hidden bg-background h-dvh snap-start overflow-y-auto dark:bg-[#111]"
        >
          <div className="mx-auto box-border flex min-h-full w-full max-w-screen-sm flex-col justify-center px-4 py-20">
            <h3 className="mb-5 text-lg font-medium">
              Skills / Certifications
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200/60 bg-white/60 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/40">
                <h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  Skills
                </h4>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {SKILLS.map((skill) => (
                    <li
                      key={skill}
                      className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-zinc-200/60 bg-white/60 p-4 backdrop-blur-md dark:border-zinc-800/60 dark:bg-zinc-950/40">
                <h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  Familiar services / tools
                </h4>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {FAMILIAR_TOOLS.map((tool) => (
                    <li
                      key={tool}
                      className="rounded-full border border-zinc-200/70 px-2.5 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                    >
                      {tool}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-zinc-200/60 bg-white/60 p-4 backdrop-blur-md sm:col-span-2 dark:border-zinc-800/60 dark:bg-zinc-950/40">
                <h4 className="text-sm font-medium text-zinc-950 dark:text-zinc-50">
                  Certifications
                </h4>
                <ul className="mt-2 grid gap-x-4 gap-y-1 text-sm text-zinc-600 sm:grid-cols-2 dark:text-zinc-400">
                  {CERTIFICATIONS.map((certification) => (
                    <li key={certification}>— {certification}</li>
                  ))}
                </ul>
              </div>
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
          className="snap-stop-always scrollbar-hidden bg-background h-dvh snap-start overflow-y-auto dark:bg-[#111]"
        >
          <div className="mx-auto box-border flex min-h-full w-full max-w-screen-sm flex-col justify-center px-4 py-20">
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
            <div className="flex flex-wrap items-center justify-start gap-2">
              {SOCIAL_LINKS.map((link) => (
                <span
                  key={link.label}
                  aria-disabled="true"
                  title="Link temporarily disabled"
                  className="inline-flex shrink-0 cursor-not-allowed items-center rounded-full bg-zinc-100 px-2.5 py-1 text-sm text-zinc-400 line-through decoration-zinc-400/70 dark:bg-zinc-900 dark:text-zinc-600 dark:decoration-zinc-600"
                >
                  {link.label}
                </span>
              ))}
              <span
                aria-disabled="true"
                title="Résumé temporarily unavailable"
                className="inline-flex shrink-0 cursor-not-allowed items-center rounded-full bg-zinc-100 px-2.5 py-1 text-sm text-zinc-400 line-through decoration-zinc-400/70 dark:bg-zinc-900 dark:text-zinc-600 dark:decoration-zinc-600"
              >
                Download résumé
              </span>
            </div>
          </div>
        </motion.section>
      </motion.main>
    </>
  )
}
