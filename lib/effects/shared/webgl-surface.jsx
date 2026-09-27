'use client'

import { Component, useSyncExternalStore } from 'react'
import { cn } from '@/lib/utils'

const subscribeMotion = (notify) => {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)')
  query.addEventListener('change', notify)
  return () => query.removeEventListener('change', notify)
}

export function useEffectReducedMotion() {
  return useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => true,
  )
}

let webglAvailable
function supportsWebGL() {
  if (webglAvailable !== undefined) return webglAvailable
  try {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('webgl2')
    webglAvailable = Boolean(context)
    context?.getExtension('WEBGL_lose_context')?.loseContext()
  } catch {
    webglAvailable = false
  }
  return webglAvailable
}
const subscribeAvailability = () => () => {}

class SurfaceBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

/** @param {{ children?: import("react").ReactNode, className?: string, style?: import("react").CSSProperties, fallback?: import("react").ReactNode }} props */
export function WebGLSurface({ children, className, style, fallback }) {
  const supported = useSyncExternalStore(
    subscribeAvailability,
    supportsWebGL,
    () => false,
  )
  return (
    <div
      className={cn(
        'relative isolate h-[28rem] w-full overflow-hidden',
        className,
      )}
      style={{ containerType: 'size', ...style }}
    >
      {supported ? (
        <SurfaceBoundary fallback={fallback}>{children}</SurfaceBoundary>
      ) : (
        fallback
      )}
    </div>
  )
}
