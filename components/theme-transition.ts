'use client'

const TRANSITION_STYLE_ID = 'theme-transition-styles'
const TRANSITION_CSS = `
  ::view-transition-group(root) {
    animation-duration: 0.55s;
    animation-timing-function: var(--expo-out);
  }

  ::view-transition-new(root) {
    animation-name: reveal-light-bottom-up;
  }

  ::view-transition-old(root),
  .dark::view-transition-old(root) {
    animation: none;
    z-index: -1;
  }

  .dark::view-transition-new(root) {
    animation-name: reveal-dark-bottom-up;
  }

  @keyframes reveal-dark-bottom-up {
    from { clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%); }
    to { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
  }

  @keyframes reveal-light-bottom-up {
    from { clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%); }
    to { clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%); }
  }
`

export function animateThemeChange(changeTheme: () => void) {
  const root = document.documentElement
  if (root.dataset.themeTransitioning === 'true') return null
  if (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
    !document.startViewTransition
  ) {
    changeTheme()
    return null
  }

  let styleElement = document.getElementById(
    TRANSITION_STYLE_ID,
  ) as HTMLStyleElement | null

  if (!styleElement) {
    styleElement = document.createElement('style')
    styleElement.id = TRANSITION_STYLE_ID
    document.head.appendChild(styleElement)
  }

  styleElement.textContent = TRANSITION_CSS
  root.dataset.themeTransitioning = 'true'

  const body = document.body
  const wasInert = body.inert
  const focusedElement = document.activeElement
  const previousOverflow = root.style.overflow
  const controller = new AbortController()
  const blockInteraction = (event: Event) => {
    event.preventDefault()
    event.stopImmediatePropagation()
  }
  for (const event of [
    'click',
    'pointerdown',
    'keydown',
    'wheel',
    'touchmove',
  ]) {
    window.addEventListener(event, blockInteraction, {
      capture: true,
      passive: false,
      signal: controller.signal,
    })
  }
  body.inert = true
  root.style.overflow = 'hidden'

  const restoreInteraction = () => {
    delete root.dataset.themeTransitioning
    body.inert = wasInert
    root.style.overflow = previousOverflow
    controller.abort()
    if (focusedElement instanceof HTMLElement && focusedElement.isConnected) {
      focusedElement.focus({ preventScroll: true })
    }
  }

  try {
    const transition = document.startViewTransition(changeTheme)
    void transition.finished.then(restoreInteraction, restoreInteraction)
    return transition
  } catch (error) {
    restoreInteraction()
    throw error
  }
}
