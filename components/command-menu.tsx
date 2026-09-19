'use client'

import * as React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutGrid,
  Palette,
  BriefcaseBusiness,
  PanelsTopLeft,
  Monitor,
  Moon,
  Play,
  Sun,
  Star,
  Sparkles,
} from 'lucide-react'
import {
  setCursorTrailEnabled,
  useCursorTrailEnabled,
} from '@/hooks/use-cursor-trail'
import { PRELOADER_REPLAY_EVENT } from '@/components/site-preloader'
import { useTheme } from '@/components/theme-provider'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { AppleSpotlight } from '@/components/ui/apple-spotlight'

const PAGE_COMMANDS = [
  {
    label: 'Professional',
    href: '/',
    icon: BriefcaseBusiness,
    disabled: false,
  },
  {
    label: 'Projects',
    href: '/projects',
    icon: PanelsTopLeft,
    disabled: false,
  },
  {
    label: 'Reviews',
    href: '/reviews',
    icon: Star,
    disabled: false,
  },
] as const

type CommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const pathname = usePathname()
  const router = useRouter()
  const cursorTrailEnabled = useCursorTrailEnabled()
  const { setTheme } = useTheme()
  const prefersReducedMotion = usePrefersReducedMotion()

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== 'k' ||
        (!event.metaKey && !event.ctrlKey)
      ) {
        return
      }

      event.preventDefault()
      onOpenChange(!open)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onOpenChange, open])

  const runCommand = React.useCallback(
    (command: () => void) => {
      onOpenChange(false)
      command()
    },
    [onOpenChange],
  )

  const goToPage = (href: string) => {
    if (pathname !== href) {
      router.push(href)
      return
    }

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    })
  }

  const replayPreloader = () => {
    window.dispatchEvent(new Event(PRELOADER_REPLAY_EVENT))
  }

  const commands = [
    ...PAGE_COMMANDS.map((item) => ({
      id: item.href,
      label: item.label,
      description: item.disabled ? 'Page · Coming soon' : 'Open page',
      icon: <item.icon />,
      disabled: item.disabled,
      onSelect: () => runCommand(() => goToPage(item.href)),
    })),
    ...(
      [
        { theme: 'light', icon: Sun },
        { theme: 'dark', icon: Moon },
        { theme: 'system', icon: Monitor },
      ] as const
    ).map((item) => ({
      id: item.theme,
      label: `Use ${item.theme} theme`,
      description: 'Appearance',
      icon: <item.icon />,
      onSelect: () => runCommand(() => setTheme(item.theme)),
    })),
    {
      id: 'cursor-trail',
      label: cursorTrailEnabled
        ? 'Disable cursor trail'
        : 'Enable cursor trail',
      description: 'Appearance · Theme effects',
      icon: <Sparkles />,
      onSelect: () =>
        runCommand(() => setCursorTrailEnabled(!cursorTrailEnabled)),
    },
    {
      id: 'replay',
      label: 'Replay preloader',
      description: 'Replay intro animation',
      icon: <Play />,
      onSelect: () => runCommand(replayPreloader),
    },
  ]

  return (
    <AppleSpotlight
      open={open}
      onOpenChange={onOpenChange}
      commands={commands}
      shortcuts={[
        { label: 'Pages', icon: <LayoutGrid />, search: 'page' },
        { label: 'Appearance', icon: <Palette />, search: 'theme' },
        {
          label: 'Replay intro',
          icon: <Play />,
          onSelect: () => runCommand(replayPreloader),
        },
      ]}
    />
  )
}
