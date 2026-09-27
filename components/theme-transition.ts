'use client'

const TRANSITION_STYLE_ID = 'theme-transition-styles'
const TRANSITION_CSS = `
  ::view-transition-group(root) {
    animation-duration: 0.7s;
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
  const root = document.documentElement
  root.dataset.themeTransitioning = 'true'

  const transition = document.startViewTransition(changeTheme)
  const restoreCursor = () => {
    delete root.dataset.themeTransitioning
  }
  void transition.finished.then(restoreCursor, restoreCursor)

  return transition
}
