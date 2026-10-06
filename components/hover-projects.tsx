'use client'

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

export type ShowcaseProject = {
  title: string
  category: string
  href?: string
}

let projectEntrancePlayed = false

export function HoverProjects({ projects }: { projects: ShowcaseProject[] }) {
  const [skipEntrance] = useState(() => projectEntrancePlayed)
  const listRef = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const descriptionsDelay =
    Math.max(
      0,
      ...projects.map(
        (project, index) =>
          120 +
          index * 780 +
          Math.max(600, 450 + (Array.from(project.title).length - 1) * 30),
      ),
    ) + 60

  useLayoutEffect(() => {
    const list = listRef.current
    if (list && projectEntrancePlayed) list.dataset.projectEntrance = 'complete'
    const page = list?.closest<HTMLElement>('[data-projects-page]')
    return () => {
      if (list && projectEntrancePlayed)
        list.dataset.projectEntrance = 'complete'
      if (page) delete page.dataset.projectAnimation
    }
  }, [])

  useEffect(() => {
    const panels = listRef.current?.querySelectorAll<HTMLElement>(
      '[data-project-panel]',
    )
    if (!panels || reducedMotion) return
    const cleanups = Array.from(panels).map(subscribeToProjectParallax)
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [projects, reducedMotion])

  return (
    <div className="min-h-0 flex-1">
      <div
        ref={listRef}
        className="grid h-full grid-cols-1 grid-rows-3 md:grid-cols-3 md:grid-rows-1"
        style={
          {
            '--project-descriptions-delay': `${descriptionsDelay}ms`,
          } as CSSProperties
        }
        data-project-entrance={skipEntrance ? 'complete' : 'playing'}
        onAnimationStart={(event) => {
          if (skipEntrance) return
          const target = event.target as HTMLElement
          const page = listRef.current?.closest<HTMLElement>(
            '[data-projects-page]',
          )
          if (!page) return
          const title = target.closest<HTMLElement>('[data-project-title]')
          if (title) {
            projectEntrancePlayed = true
            page.dataset.projectAnimation = title.dataset.projectTitle
          } else if (target.matches('[data-project-description]'))
            delete page.dataset.projectAnimation
        }}
        data-cursor-exclude=""
      >
        {projects.map((project, index) => (
          <section
            key={project.title}
            id={project.title.toLowerCase()}
            aria-label={project.title}
            className="flex min-w-0 flex-col items-center justify-center px-2 text-center sm:px-6"
            style={
              {
                '--project-entry-delay': `${120 + index * 780}ms`,
              } as CSSProperties
            }
            data-project-panel=""
            data-project-theme={project.title.toLowerCase()}
          >
            <div>
              <ProjectText project={project} />
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function ProjectText({ project }: { project: ShowcaseProject }) {
  const className =
    'flex w-full min-w-0 flex-col items-center gap-3 py-2 text-center'
  const content = (
    <>
      <h2
        aria-label={project.title}
        data-project-title={project.title.toLowerCase()}
        className="text-[clamp(2.25rem,10vw,3rem)] font-medium tracking-tight md:text-[clamp(1.125rem,3.5vw,3rem)]"
      >
        <span className="project-title-effect" aria-hidden="true">
          {Array.from(project.title).map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="project-letter"
              style={{ '--letter-delay': `${index * 30}ms` } as CSSProperties}
            >
              {letter}
            </span>
          ))}
        </span>
      </h2>
      <p
        data-project-description=""
        className="flex min-w-0 items-start justify-center gap-1 text-sm text-zinc-500 sm:gap-2 dark:text-zinc-400"
      >
        <span>{project.category}</span>
        {project.href && (
          <ArrowUpRight aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        )}
      </p>
    </>
  )

  return project.href ? (
    <a
      href={project.href}
      className={`${className} rounded-sm transition-opacity duration-300 outline-none hover:opacity-50 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-4`}
    >
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  )
}

function subscribeToProjectParallax(panel: HTMLElement) {
  const title = panel.querySelector<HTMLElement>('[data-project-title]')
  if (!title) return () => {}
  const options = { duration: 0.45, ease: 'power3.out' }
  const titleX = gsap.quickTo(title, 'x', options)
  const titleY = gsap.quickTo(title, 'y', options)
  const move = (event: PointerEvent) => {
    if (
      event.pointerType !== 'mouse' ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    )
      return
    const rect = panel.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    const y = ((event.clientY - rect.top) / rect.height) * 2 - 1
    titleX(x * Math.min(14, rect.width * 0.06))
    titleY(y * 10)
  }
  const reset = () => {
    titleX(0)
    titleY(0)
  }
  panel.addEventListener('pointermove', move)
  panel.addEventListener('pointerleave', reset)
  return () => {
    panel.removeEventListener('pointermove', move)
    panel.removeEventListener('pointerleave', reset)
    for (const animation of [titleX, titleY]) animation.tween.kill()
    gsap.set(title, { clearProps: 'transform' })
  }
}
