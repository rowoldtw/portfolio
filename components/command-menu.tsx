'use client'

import { usePathname, useRouter } from 'next/navigation'
import {
  BriefcaseBusiness,
  PanelsTopLeft,
  Monitor,
  Moon,
  Play,
  Sun,
  Star,
  Cpu,
  AppWindow,
  Disc3,
} from 'lucide-react'
import { PRELOADER_REPLAY_EVENT } from '@/components/site-preloader'
import { useTheme } from '@/components/theme-provider'
import { animateThemeChange } from '@/components/theme-transition'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'
import { SkiperCommandMenu } from '@/components/ui/skiper-command-menu'
import { useReviewCollection } from '@/components/review-collection-provider'

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

const REVIEW_COMMANDS = [
  { id: 'hardware', label: 'Hardware', icon: Cpu },
  { id: 'software', label: 'Software', icon: AppWindow },
  { id: 'albums', label: 'Albums', icon: Disc3 },
] as const

type CommandMenuProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandMenu({ open, onOpenChange }: CommandMenuProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { setTheme } = useTheme()
  const { setCollection } = useReviewCollection()
  const prefersReducedMotion = usePrefersReducedMotion()

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
      group: 'Pages',
      description: item.disabled
        ? 'Page coming soon'
        : `Open ${item.label} page`,
      icon: <item.icon />,
      disabled: item.disabled,
      onSelect: () => goToPage(item.href),
    })),
    ...REVIEW_COMMANDS.map((item) => ({
      id: `/reviews?collection=${item.id}`,
      label: item.label,
      group: 'Reviews',
      description: `Open ${item.label} reviews`,
      icon: <item.icon />,
      onSelect: () => {
        setCollection(item.id)
        if (pathname !== '/reviews') {
          router.push(`/reviews?collection=${item.id}`)
        }
        onOpenChange(false)
      },
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
      group: 'Appearance',
      description:
        item.theme === 'system'
          ? 'Follow system appearance'
          : `Switch to ${item.theme} appearance`,
      icon: <item.icon />,
      onSelect: () => animateThemeChange(() => setTheme(item.theme)),
    })),
    {
      id: 'replay',
      label: 'Replay preloader',
      group: 'Actions',
      description: 'Play the introduction again',
      icon: <Play />,
      onSelect: replayPreloader,
    },
  ]

  return (
    <SkiperCommandMenu
      open={open}
      onOpenChange={onOpenChange}
      commands={commands}
    />
  )
}
