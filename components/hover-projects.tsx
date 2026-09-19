'use client'

import Image from 'next/image'
import { useEffect, useId, useRef } from 'react'
import gsap from 'gsap'
import { ArrowUpRight } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

export type ShowcaseProject = {
  title: string
  category: string
  imageSrc: string
  imageAlt: string
}

// ObsidianUI Hover Image: persistent thumbnail stack and GSAP quickTo movement.
export function HoverProjects({ projects }: { projects: ShowcaseProject[] }) {
  const listRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewId = useId()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const list = listRef.current
    const preview = previewRef.current
    if (!list || !preview) return
    const rows = Array.from(list.querySelectorAll('button'))
    const thumbnails = Array.from(preview.children)
    const duration = reducedMotion ? 0 : 0.4

    gsap.set(preview, { scale: 0, xPercent: -50, yPercent: -50 })
    gsap.set(thumbnails, { yPercent: 0 })
    const xTo = gsap.quickTo(preview, 'x', { duration, ease: 'power3.out' })
    const yTo = gsap.quickTo(preview, 'y', { duration, ease: 'power3.out' })

    const show = (index: number) => {
      preview.setAttribute('data-project-preview', '')
      rows.forEach((row, i) =>
        row.setAttribute('aria-expanded', String(i === index)),
      )
      gsap.to(preview, {
        scale: 1,
        duration,
        ease: 'power2.out',
        overwrite: 'auto',
      })
      gsap.to(thumbnails, {
        yPercent: -100 * index,
        duration,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }
    const hide = () => {
      rows.forEach((row) => row.setAttribute('aria-expanded', 'false'))
      gsap.to(preview, {
        scale: 0,
        duration: reducedMotion ? 0 : 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
        onComplete: () => preview.removeAttribute('data-project-preview'),
      })
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hide()
    }
    const cleanupRows = rows.map((row, index) => {
      const focus = () => {
        if (!row.matches(':focus-visible')) return
        const rect = row.getBoundingClientRect()
        xTo(Math.min(window.innerWidth - 216, Math.max(216, rect.right - 200)))
        yTo(Math.max(141, rect.top))
        show(index)
      }
      row.addEventListener('focus', focus)
      row.addEventListener('blur', hide)
      return () => {
        row.removeEventListener('focus', focus)
        row.removeEventListener('blur', hide)
      }
    })
    list.addEventListener('keydown', escape)

    return () => {
      list.removeEventListener('keydown', escape)
      cleanupRows.forEach((cleanup) => cleanup())
      xTo.tween.kill()
      yTo.tween.kill()
      gsap.killTweensOf([preview, ...thumbnails])
      preview.removeAttribute('data-project-preview')
    }
  }, [projects, reducedMotion])

  return (
    <div>
      <div
        ref={listRef}
        data-cursor-exclude=""
        data-project-images={JSON.stringify(
          projects.map((project) => project.imageSrc),
        )}
      >
        {projects.map((project, index) => (
          <div
            key={project.title}
            className="border-t border-zinc-300/70 last:border-b dark:border-zinc-800"
          >
            <button
              data-project-cursor={index}
              type="button"
              aria-label={`Preview ${project.title}`}
              aria-expanded={false}
              aria-controls={previewId}
              className="group flex w-full items-center justify-between gap-4 py-7 text-left transition-opacity duration-500 outline-none hover:opacity-50 focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-inset sm:px-8 sm:py-9"
            >
              <span className="text-3xl font-medium tracking-tight transition-transform duration-500 motion-safe:group-hover:-translate-x-[15px] sm:text-5xl">
                {project.title}
              </span>
              <span className="flex items-center gap-3 text-xs text-zinc-500 transition-transform duration-500 motion-safe:group-hover:translate-x-[15px] sm:text-sm dark:text-zinc-400">
                {project.category}
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </span>
            </button>
            <div className="relative mb-6 aspect-[8/5] overflow-hidden rounded-xl min-[769px]:hidden">
              <Image
                src={project.imageSrc}
                alt={project.imageAlt}
                fill
                sizes="(max-width: 768px) calc(100vw - 48px), 400px"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
      <div
        ref={previewRef}
        id={previewId}
        aria-hidden="true"
        style={{ transform: 'scale(0)' }}
        className="pointer-events-none fixed top-0 left-0 z-40 flex h-[250px] w-[400px] origin-center flex-col overflow-hidden rounded-xl bg-zinc-100 shadow-2xl max-[768px]:hidden dark:bg-zinc-900"
      >
        {projects.map((project) => (
          <div key={project.title} className="relative h-full w-full shrink-0">
            <Image
              src={project.imageSrc}
              alt={project.imageAlt}
              fill
              sizes="400px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
