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
  const discRef = useRef<HTMLSpanElement>(null)
  const stackRef = useRef<HTMLDivElement>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const reducedMotion = usePrefersReducedMotion()
  const active = preview?.active ?? false

  useEffect(() => {
    const position = positionRef.current
    if (!position || window.self !== window.top) return
    const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let spin: Animation | undefined
    let currentRow: Element | null = null
    let currentGroup: Element | null = null
    let images: string[] = []
    let x = 0
    let y = 0
    const select = (target: Element | null) => {
      const control = target?.closest(
        'a[href], button, summary, input, textarea, select, label, [role="button"], [role="link"], [role="option"], [contenteditable="true"]',
      )
      const text = target?.closest(
        'p, h1, h2, h3, h4, h5, h6, li, blockquote, code, span',
      )
      const disabled = target?.closest(':disabled, [aria-disabled="true"]')
      const selectable =
        !disabled &&
        (control || (text && getComputedStyle(text).userSelect !== 'none'))
      position.dataset.cursorSelectable = selectable ? 'true' : 'false'

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
        if (!motion.matches && !currentRow) {
          spin?.cancel()
          spin = discRef.current?.animate(
            [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
            { duration: 420, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
          )
        }
      }
    }
    const hide = () => {
      release()
      spin?.cancel()
      position.style.visibility = 'hidden'
      delete document.documentElement.dataset.customCursor
      currentRow = null
      setPreview((current) => (current ? { ...current, active: false } : null))
    }
    const move = (event: PointerEvent) => {
      if (!pointer.matches || event.pointerType !== 'mouse') {
        hide()
        return
      }
      x = event.clientX
      y = event.clientY
      position.style.transform = `translate3d(${x}px, ${y}px, 0)`
      position.style.visibility = 'visible'
      document.documentElement.dataset.customCursor = 'true'
      select(event.target instanceof Element ? event.target : null)
    }
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'Escape') hide()
    }
    const scroll = () => {
      if (document.documentElement.dataset.customCursor)
        select(document.elementFromPoint(x, y))
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
      spin?.cancel()
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
      className="pointer-events-none invisible fixed top-0 left-0 z-[100]"
    >
      <div
        data-project-preview={active ? '' : undefined}
        data-cursor-shape={active ? 'preview' : 'circle'}
        className="relative -translate-x-1/2 -translate-y-1/2 overflow-hidden [[data-cursor-pressed=true]_&[data-cursor-shape=circle]]:scale-[0.7] [[data-cursor-pressed=true]_&[data-cursor-shape=circle]]:[--cursor-scale-duration:100ms] [[data-cursor-selectable=true]:not([data-cursor-pressed=true])_&[data-cursor-shape=circle]]:scale-[1.45]"
        style={{
          width: active ? 400 : 14,
          height: active ? 250 : 14,
          borderRadius: active ? 12 : 7,
          transition: reducedMotion
            ? 'none'
            : 'width 240ms ease, height 240ms ease, border-radius 240ms ease, scale var(--cursor-scale-duration, 350ms) cubic-bezier(0.34, 1.9, 0.64, 1)',
        }}
      >
        <span
          ref={discRef}
          className="absolute inset-0 rounded-full bg-[linear-gradient(135deg,#000_50%,#fff_50%)] dark:bg-[linear-gradient(135deg,#fff_50%,#000_50%)]"
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
