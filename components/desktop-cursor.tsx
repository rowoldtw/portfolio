'use client'

import dynamic from 'next/dynamic'
import { useSyncExternalStore } from 'react'

const CustomCursor = dynamic(
  () =>
    import('@/components/ui/custom-cursor').then(
      (module) => module.CustomCursor,
    ),
  { ssr: false },
)

const POINTER_QUERY = '(hover: hover) and (pointer: fine)'

function subscribe(callback: () => void) {
  const pointer = window.matchMedia(POINTER_QUERY)
  pointer.addEventListener('change', callback)
  return () => pointer.removeEventListener('change', callback)
}

function hasMousePointer() {
  return window.self === window.top && window.matchMedia(POINTER_QUERY).matches
}

export function DesktopCursor() {
  const enabled = useSyncExternalStore(subscribe, hasMousePointer, () => false)
  return enabled ? <CustomCursor /> : null
}
