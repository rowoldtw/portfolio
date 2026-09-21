'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

type Preview = { images: string[]; index: number; active: boolean }

export function CustomCursor() {
  const pathname = usePathname()
  return <Cursor pathname={pathname} />
}

function Cursor({ pathname }: { pathname: string }) {
  const refreshRef = useRef<(() => void) | null>(null)
  const positionRef = useRef<HTMLDivElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [linkWidth, setLinkWidth] = useState<number | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const active = preview?.active ?? false

  useEffect(() => {
    const position = positionRef.current
    if (!position || window.self !== window.top) return

    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    let currentLink: HTMLAnchorElement | null = null
    let currentRow: Element | null = null
    let currentGroup: Element | null = null
    let images: string[] = []
    let x = 0
    let y = 0

    const select = (target: Element | null) => {
      const disabled = target?.closest(':disabled, [aria-disabled="true"]')
      const control = target?.closest(
        'a[href], button, summary, input, textarea, select, label, [role="button"], [role="link"], [role="option"], [contenteditable="true"]',
      )
      const selectable = !disabled && Boolean(control)
      position.dataset.cursorSelectable = selectable ? 'true' : 'false'

      const underlineScope = target?.closest('[data-cursor-link-underline]')
      const anchor = underlineScope && !disabled
        ? target?.closest<HTMLAnchorElement>('a[href]')
        : null
      const link = anchor?.textContent?.trim() ? anchor : null

      if (link && link !== currentLink) {
        currentLink = link
        position.dataset.cursorLink = 'true'
        const label = link.querySelector<HTMLElement>(
          '[data-cursor-link-label]',
        )
        const linkRect = link.getBoundingClientRect()
        const labelRect = label?.getBoundingClientRect() ?? linkRect
        const width = Math.max(12, labelRect.width)
        const centerX = labelRect.left + labelRect.width / 2
        const bottom = labelRect.bottom

        position.style.transform = `translate3d(${centerX}px, ${bottom + 2}px, 0)`
        setLinkWidth((current) =>
          current === width ? current : Math.round(width * 100) / 100,
        )
      } else if (!link) {
        currentLink = null
        delete position.dataset.cursorLink
        position.style.transform = `translate3d(${x}px, ${y}px, 0)`
        setLinkWidth(null)
      }

      const row = target?.closest('[data-project-cursor]') ?? null
      if (row === currentRow) return
      currentRow = row
      const group = row?.closest('[data-project-images]')
      if (!row || !group) {
        setPreview((current) =>
          current ? { ...current, active: false } : null,
        )
        return
      }
      if (group !== currentGroup) {
        images = JSON.parse(group.getAttribute('data-project-images') ?? '[]')
        currentGroup = group
      }
      setPreview({
        active: true,
        images,
        index: Number(row.getAttribute('data-project-cursor')),
      })
    }

    const release = () => {
      delete position.dataset.cursorPressed
    }
    const press = (event: PointerEvent) => {
      move(event)
      if (pointer.matches && event.pointerType === 'mouse') {
        position.dataset.cursorPressed = 'true'
      }
    }
    const hide = () => {
      release()
      position.style.visibility = 'hidden'
      delete document.documentElement.dataset.customCursor
      delete position.dataset.cursorLink
      currentLink = null
      currentRow = null
      setLinkWidth(null)
      setPreview((current) => (current ? { ...current, active: false } : null))
    }
    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType !== 'mouse') {
        hide()
        return
      }
      x = event.clientX
      y = event.clientY
      position.style.visibility = 'visible'
      document.documentElement.dataset.customCursor = 'true'
      select(event.target instanceof Element ? event.target : null)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'Escape') hide()
    }
    const scroll = () => {
      if (document.documentElement.dataset.customCursor) {
        currentLink = null
        select(document.elementFromPoint(x, y))
      }
    }

    refreshRef.current = scroll
    window.addEventListener('pointerdown', press)
    window.addEventListener('pointerup', release)
    window.addEventListener('pointercancel', release)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerover', move)
    document.documentElement.addEventListener('pointerleave', hide)
    window.addEventListener('blur', hide)
    window.addEventListener('keydown', key)
    window.addEventListener('scroll', scroll, true)
    pointer.addEventListener('change', hide)

    return () => {
      refreshRef.current = null
      window.removeEventListener('pointerdown', press)
      window.removeEventListener('pointerup', release)
      window.removeEventListener('pointercancel', release)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerover', move)
      document.documentElement.removeEventListener('pointerleave', hide)
      window.removeEventListener('blur', hide)
      window.removeEventListener('keydown', key)
      window.removeEventListener('scroll', scroll, true)
      pointer.removeEventListener('change', hide)
      position.style.visibility = 'hidden'
      delete document.documentElement.dataset.customCursor
    }
  }, [])

  useEffect(() => {
    refreshRef.current?.()
  }, [pathname])

  useLayoutEffect(() => {
    const stack = stackRef.current
    if (!stack || !preview) return
    const tween = gsap.to(stack.children, {
      yPercent: -100 * preview.index,
      duration: reducedMotion ? 0 : 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    return () => {
      tween.kill()
    }
  }, [preview, reducedMotion])

  return (
    <div
      ref={positionRef}
      aria-hidden="true"
      data-custom-cursor-position=""
      className="pointer-events-none invisible fixed top-0 left-0 z-[100] data-[cursor-link=true]:transition-transform data-[cursor-link=true]:duration-200 data-[cursor-link=true]:ease-out motion-reduce:transition-none"
    >
      <div
        data-project-preview={active ? '' : undefined}
        data-cursor-shape={
          active ? 'preview' : linkWidth ? 'underline' : 'circle'
        }
        className="relative -translate-x-1/2 -translate-y-1/2 overflow-hidden [[data-cursor-pressed=true]_&]:scale-[0.88] [[data-cursor-pressed=true]_&]:[--cursor-scale-duration:100ms] [[data-cursor-selectable=true]:not([data-cursor-pressed=true])_&[data-cursor-shape=circle]]:scale-[1.45] [[data-cursor-selectable=true][data-cursor-pressed=true]_&[data-cursor-shape=circle]]:scale-[1.15]"
        style={{
          width: active ? 400 : (linkWidth ?? 14),
          height: active ? 250 : linkWidth ? 2 : 14,
          borderRadius: active ? 12 : linkWidth ? 1 : 7,
          transition: reducedMotion
            ? 'none'
            : 'width 240ms ease, height 240ms ease, border-radius 240ms ease, scale var(--cursor-scale-duration, 350ms) cubic-bezier(0.34, 1.9, 0.64, 1)',
        }}
      >
        <span
          className="absolute inset-0 rounded-full bg-black dark:bg-white"
          style={{ opacity: active ? 0 : 1 }}
        />
        {preview && (
          <div
            ref={stackRef}
            style={{
              opacity: active ? 1 : 0,
              transition: reducedMotion ? 'none' : 'opacity 180ms ease',
            }}
            className="absolute top-1/2 left-1/2 flex h-[250px] w-[400px] -translate-x-1/2 -translate-y-1/2 flex-col"
          >
            {preview.images.map((src) => (
              <div key={src} className="relative h-full w-full shrink-0">
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="400px"
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
