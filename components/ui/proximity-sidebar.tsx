'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from 'motion/react'

type Side = 'left' | 'right'
type SectionKind = 'title' | 'subtitle' | 'section' | 'body'

export type ProximitySection = {
  id: string
  label: string
  kind?: SectionKind
}

type DashPreset = {
  base: number
  bump: number
  className: string
}

type DashProps = {
  active: boolean
  mouseY: MotionValue<number>
  onSelect: (id: string) => void
  registerDash: (id: string, node: HTMLButtonElement | null) => void
  section: ProximitySection
  side: Side
}

type ProximitySidebarProps = {
  activeOffset?: number
  className?: string
  sections: ProximitySection[]
  side?: Side
}

const RADIUS = 40
const MAX_DASH_WIDTH = 110
const SCROLL_IDLE_RESET_DELAY = 80
const SELECTION_IDLE_RESET_DELAY = 120
const SELECTION_RESET_FALLBACK_DELAY = 1200

const DASH_PRESETS: Record<SectionKind, DashPreset> = {
  title: { base: 40, bump: 70, className: 'bg-foreground' },
  subtitle: { base: 36, bump: 64, className: 'bg-foreground' },
  section: { base: 30, bump: 56, className: 'bg-muted-foreground/40' },
  body: { base: 24, bump: 50, className: 'bg-muted-foreground/40' },
}

const getSectionElement = (id: string) =>
  typeof document === 'undefined' ? null : document.getElementById(id)

function Dash({
  active,
  mouseY,
  onSelect,
  registerDash,
  section,
  side,
}: DashProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const preset = DASH_PRESETS[section.kind ?? 'body']
  const activeWidth = preset.base + preset.bump

  useEffect(() => {
    registerDash(section.id, ref.current)
    return () => registerDash(section.id, null)
  }, [registerDash, section.id])

  const distance = useTransform(mouseY, (y) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return RADIUS
    return y - (rect.top + rect.height / 2)
  })
  const targetScaleX = useTransform(
    distance,
    [-RADIUS, 0, RADIUS],
    [
      preset.base / MAX_DASH_WIDTH,
      activeWidth / MAX_DASH_WIDTH,
      preset.base / MAX_DASH_WIDTH,
    ],
    { clamp: true },
  )
  const scaleX = useSpring(targetScaleX, {
    stiffness: 320,
    damping: 34,
    mass: 0.7,
  })

  return (
    <button
      ref={ref}
      type="button"
      aria-current={active ? 'location' : undefined}
      aria-label={`Go to ${section.label}`}
      title={section.label}
      onClick={() => onSelect(section.id)}
      className="group flex h-px w-[110px] items-center border-0 bg-transparent p-0 outline-none"
    >
      <motion.span
        className={`group-focus-visible:ring-ring block h-px transition-colors duration-150 ease-out group-focus-visible:ring-2 group-focus-visible:ring-offset-2 ${preset.className}`}
        style={{
          scaleX,
          transformOrigin: side === 'left' ? 'left center' : 'right center',
          width: MAX_DASH_WIDTH,
        }}
      />
    </button>
  )
}

export function ProximitySidebar({
  activeOffset = 0.4,
  className = '',
  side = 'right',
  sections,
}: ProximitySidebarProps) {
  const mouseY = useMotionValue(Infinity)
  const shouldReduceMotion = useReducedMotion()
  const dashRefs = useRef(new Map<string, HTMLButtonElement>())
  const pointerInside = useRef(false)
  const resetTimer = useRef<number | null>(null)
  const selectionInProgress = useRef(false)
  const selectionResetTimer = useRef<number | null>(null)
  const [activeId, setActiveId] = useState(sections[0]?.id)
  const sectionIds = useMemo(
    () => sections.map((section) => section.id).join('|'),
    [sections],
  )

  const registerDash = useCallback(
    (id: string, node: HTMLButtonElement | null) => {
      if (node) dashRefs.current.set(id, node)
      else dashRefs.current.delete(id)
    },
    [],
  )
  const clearPendingReset = useCallback(() => {
    if (!resetTimer.current) return
    window.clearTimeout(resetTimer.current)
    resetTimer.current = null
  }, [])
  const clearSelectionReset = useCallback(() => {
    if (!selectionResetTimer.current) return
    window.clearTimeout(selectionResetTimer.current)
    selectionResetTimer.current = null
  }, [])
  const scheduleSelectionReset = useCallback(
    (delay = SELECTION_IDLE_RESET_DELAY) => {
      clearSelectionReset()
      selectionResetTimer.current = window.setTimeout(() => {
        selectionInProgress.current = false
        selectionResetTimer.current = null
      }, delay)
    },
    [clearSelectionReset],
  )
  const setMouseToDash = useCallback(
    (id?: string) => {
      if (!id) {
        mouseY.set(Infinity)
        return
      }
      const node = dashRefs.current.get(id)
      if (!node) return
      const rect = node.getBoundingClientRect()
      mouseY.set(rect.top + rect.height / 2)
    },
    [mouseY],
  )
  const pulseDash = useCallback(
    (id?: string) => {
      setMouseToDash(id)
      clearPendingReset()
      if (!id || pointerInside.current) return
      resetTimer.current = window.setTimeout(() => {
        mouseY.set(Infinity)
        resetTimer.current = null
      }, SCROLL_IDLE_RESET_DELAY)
    },
    [clearPendingReset, mouseY, setMouseToDash],
  )
  const selectSection = useCallback(
    (id: string) => {
      const element = getSectionElement(id)
      if (!element) return
      selectionInProgress.current = true
      scheduleSelectionReset(SELECTION_RESET_FALLBACK_DELAY)
      element.scrollIntoView({
        behavior: shouldReduceMotion ? 'auto' : 'smooth',
        block: 'start',
      })
      window.history.replaceState(window.history.state, '', `#${id}`)
      setActiveId(id)
    },
    [scheduleSelectionReset, shouldReduceMotion],
  )

  useEffect(
    () => () => {
      clearPendingReset()
      clearSelectionReset()
    },
    [clearPendingReset, clearSelectionReset],
  )

  useEffect(() => {
    if (!sections.length) return
    let frame = 0

    const updateActiveSection = (shouldPulse = true) => {
      frame = 0
      const anchorY = window.innerHeight * activeOffset
      let nextActiveId = sections[0]?.id
      let shortestDistance = Number.POSITIVE_INFINITY

      for (const section of sections) {
        const element = getSectionElement(section.id)
        if (!element) continue
        const rect = element.getBoundingClientRect()
        const distance = Math.abs(rect.top - anchorY)
        if (distance < shortestDistance) {
          shortestDistance = distance
          nextActiveId = section.id
        }
      }

      setActiveId(nextActiveId)
      if (
        shouldPulse &&
        !pointerInside.current &&
        !selectionInProgress.current
      ) {
        pulseDash(nextActiveId)
      }
    }
    const scheduleUpdate = () => {
      if (frame) return
      frame = window.requestAnimationFrame(() => updateActiveSection())
    }
    const handleScroll = () => {
      if (selectionInProgress.current) scheduleSelectionReset()
      scheduleUpdate()
    }

    updateActiveSection(false)
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', scheduleUpdate)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [activeOffset, pulseDash, scheduleSelectionReset, sectionIds, sections])

  return (
    <nav
      aria-label="Review sections"
      className={`flex h-full min-h-0 items-center ${side === 'left' ? 'justify-start' : 'justify-end'} ${className}`}
    >
      <div
        className={`mx-4 flex flex-col ${side === 'right' ? 'items-end' : 'items-start'}`}
        style={{ gap: 8 }}
        onPointerMove={(event) => {
          clearPendingReset()
          pointerInside.current = true
          mouseY.set(event.clientY)
        }}
        onPointerLeave={() => {
          pointerInside.current = false
          mouseY.set(Infinity)
        }}
      >
        {sections.map((section) => (
          <Dash
            key={section.id}
            active={section.id === activeId}
            mouseY={mouseY}
            onSelect={selectSection}
            registerDash={registerDash}
            section={section}
            side={side}
          />
        ))}
      </div>
    </nav>
  )
}
